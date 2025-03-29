pipeline {
    agent any

    environment {
        APP_NAME = "tp02-pipeline"
        DOCKER_IMAGE = "${APP_NAME}:${env.BUILD_ID}"
    }

    stages {
        // Étape 1 - Clonage du dépôt
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                url: 'https://github.com/MohamedDaboub/TP02-pipeline.git'
            }
        }

        // Étape 2 - Installation des dépendances
        stage('Install Dependencies') {
            steps {
                sh '''
                rm -rf node_modules
                rm -f package-lock.json
                npm install
                chmod -R 755 node_modules/.bin
                '''
            }
        }

        // Étape 3 - Exécution des tests (version simplifiée)
        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        // Étape 4 - Vérification Docker
        stage('Check Docker') {
            steps {
                script {
                    env.DOCKER_AVAILABLE = sh(
                        script: 'docker --version >/dev/null 2>&1 && echo "yes" || echo "no"',
                        returnStdout: true
                    ).trim()
                    echo "Docker disponible: ${env.DOCKER_AVAILABLE}"
                }
            }
        }

        // Étape 5 - Build Docker (conditionnelle)
        stage('Build Docker Image') {
            when {
                expression { env.DOCKER_AVAILABLE == 'yes' }
            }
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }

        // Étape 6 - Exécution (Docker ou Node direct)
        stage('Run Application') {
            steps {
                script {
                    if (env.DOCKER_AVAILABLE == 'yes') {
                        sh """
                        docker stop ${APP_NAME} || true
                        docker rm ${APP_NAME} || true
                        docker run -d -p 3000:3000 --name ${APP_NAME} ${DOCKER_IMAGE}
                        """
                        echo "🟢 Application démarrée via Docker sur http://localhost:3000"
                    } else {
                        sh 'nohup npm start &'
                        echo "🟡 Application démarrée directement via Node (port 3000)"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Nettoyage des ressources...'
            script {
                if (env.DOCKER_AVAILABLE == 'yes') {
                    sh 'docker container prune -f || true'
                }
                sh 'pkill -f "node.*app.js" || true'  // Tue les processus Node éventuels
            }
            cleanWs()
        }
        success {
            echo '✅ SUCCÈS : Pipeline terminé avec succès'
        }
        failure {
            echo '❌ ÉCHEC : Erreur durant l\'exécution'
        }
    }
}