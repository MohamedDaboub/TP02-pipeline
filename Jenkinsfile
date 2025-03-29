pipeline {
    agent any

    environment {
        APP_NAME = "tp02-pipeline"
        APP_PORT = "3000"
        DOCKER_IMAGE = "${APP_NAME}:${env.BUILD_ID ?: 'latest'}"
    }

    stages {
        // Étape 1 - Préparation
        stage('Setup') {
            steps {
                script {
                    checkout scm
                    env.DOCKER_AVAILABLE = sh(
                        script: 'command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1 && echo "yes" || echo "no"',
                        returnStdout: true
                    ).trim()
                }
            }
        }

        // Étape 2 - Installation
        stage('Install') {
            steps {
                sh '''
                echo "=== Nettoyage des dépendances ==="
                rm -rf node_modules package-lock.json
                
                echo "=== Installation ==="
                npm install --no-audit --no-fund --silent
                '''
            }
        }

        // Étape 3 - Tests (version corrigée)
        stage('Test') {
            steps {
                script {
                    try {
                        // Exécute les tests et capture le résultat
                        def testResult = sh(
                            script: 'npm test',
                            returnStatus: true
                        )
                        
                        if (testResult != 0) {
                            echo "❌ Les tests ont échoué avec le code ${testResult}"
                            currentBuild.result = 'FAILURE'
                            error("Arrêt du pipeline - Tests échoués")
                        } else {
                            echo "✅ Tous les tests ont réussi"
                        }
                    } catch (err) {
                        echo "❌ Erreur lors de l'exécution des tests : ${err}"
                        currentBuild.result = 'FAILURE'
                        error(err.toString())
                    }
                }
            }
        }

        // Étape 4 - Build Docker
        stage('Build') {
            when {
                expression { env.DOCKER_AVAILABLE == 'yes' && currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }

        // Étape 5 - Déploiement
        stage('Deploy') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                script {
                    if (env.DOCKER_AVAILABLE == 'yes') {
                        sh """
                        docker stop ${APP_NAME} >/dev/null 2>&1 || true
                        docker rm ${APP_NAME} >/dev/null 2>&1 || true
                        docker run -d -p ${APP_PORT}:${APP_PORT} --name ${APP_NAME} ${DOCKER_IMAGE}
                        """
                        echo "✅ Application déployée via Docker sur http://localhost:${APP_PORT}"
                    } else {
                        sh """
                        pkill -f "node.*app.js" >/dev/null 2>&1 || true
                        nohup npm start > app.log 2>&1 &
                        """
                        echo "✅ Application démarrée directement sur http://localhost:${APP_PORT}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "=== Nettoyage ==="
            sh """
            pkill -f "node.*app.js" >/dev/null 2>&1 || true
            docker stop ${APP_NAME} >/dev/null 2>&1 || true
            """
        }
        success {
            echo "🌈 Pipeline exécuté avec succès !"
        }
        failure {
            echo "❌ Pipeline en échec - Consultez les logs ci-dessus"
        }
    }
}