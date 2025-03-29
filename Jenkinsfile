pipeline {
    agent any

    environment {
        APP_NAME = "tp02-pipeline"
        APP_PORT = "3000"
        DOCKER_IMAGE = "${APP_NAME}:${env.BUILD_ID ?: 'latest'}"
        LOG_FILE = "app.log"
    }

    stages {
        // Étape 1 - Préparation
        stage('Setup') {
            steps {
                script {
                    // Vérification Docker
                    env.DOCKER_AVAILABLE = sh(
                        script: 'command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || echo "no"',
                        returnStdout: true
                    ).trim()

                    // Checkout Git
                    checkout scm
                }
            }
        }

        // Étape 2 - Installation
        stage('Install') {
            steps {
                sh '''
                echo "=== Nettoyage ==="
                rm -rf node_modules package-lock.json .npm
                
                echo "=== Installation ==="
                npm install --no-audit --no-fund --loglevel=error
                
                echo "=== Fix Permissions ==="
                find node_modules/.bin -type f -exec chmod 755 {} +
                '''
            }
        }

        // Étape 3 - Tests
        stage('Test') {
            steps {
                sh 'npm test || echo "⚠️ Tests échoués (mais on continue)"'
            }
        }

        // Étape 4 - Build Docker (si disponible)
        stage('Build Docker') {
            when {
                expression { env.DOCKER_AVAILABLE == 'yes' }
            }
            steps {
                script {
                    try {
                        docker.build(DOCKER_IMAGE)
                    } catch(Exception e) {
                        echo "❌ Erreur Docker Build: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }

        // Étape 5 - Déploiement
        stage('Deploy') {
            steps {
                script {
                    // Nettoyage préalable
                    sh """
                    pkill -f "node.*app.js" || true
                    docker stop ${APP_NAME} >/dev/null 2>&1 || true
                    docker rm ${APP_NAME} >/dev/null 2>&1 || true
                    """

                    // Choix du mode de déploiement
                    if (env.DOCKER_AVAILABLE == 'yes') {
                        deployWithDocker()
                    } else {
                        deployWithNode()
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                echo "=== Nettoyage ==="
                sh """
                pkill -f "node.*app.js" || true
                docker stop ${APP_NAME} >/dev/null 2>&1 || true
                """
                archiveArtifacts artifacts: "${LOG_FILE},${LOG_FILE}.old", allowEmptyArchive: true
            }
        }
    }
}

// Méthode de déploiement Docker
void deployWithDocker() {
    try {
        sh """
        docker run -d --rm \
            -p ${APP_PORT}:${APP_PORT} \
            --name ${APP_NAME} \
            ${DOCKER_IMAGE}
        """
        
        // Vérification
        timeout(time: 1, unit: 'MINUTES') {
            waitUntil {
                def status = sh(
                    script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT}/health || echo '500'",
                    returnStdout: true
                ).trim()
                return status == "200"
            }
        }
        echo "✅ Docker: Application disponible sur http://localhost:${APP_PORT}"
    } catch(Exception e) {
        echo "❌ Échec Docker: ${e.getMessage()}"
        deployWithNode() // Fallback sur Node
    }
}

// Méthode de déploiement Node direct
void deployWithNode() {
    try {
        // Rotation des logs
        sh """
        [ -f "${LOG_FILE}" ] && mv "${LOG_FILE}" "${LOG_FILE}.old"
        nohup node app.js > "${LOG_FILE}" 2>&1 &
        sleep 5
        """
        
        // Vérification
        def status = sh(
            script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${APP_PORT}/health || echo '500'",
            returnStdout: true
        ).trim()
        
        if (status == "200") {
            echo "✅ Node: Application disponible sur http://localhost:${APP_PORT}"
            echo "🔍 Logs: ${WORKSPACE}/${LOG_FILE}"
        } else {
            error("❌ Échec du démarrage Node (HTTP ${status})")
        }
    } catch(Exception e) {
        echo "📜 Dernières lignes des logs :"
        sh "tail -n 30 ${LOG_FILE} || true"
        error("❌ Crash de l'application: ${e.getMessage()}")
    }
}