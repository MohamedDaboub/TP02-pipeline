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
                sh 'rm -rf node_modules || true'
                sh 'npm ci'
                sh 'chmod -R 755 node_modules/.bin'
            }
        }

        // Étape 3 - Exécution des tests
        stage('Run Tests') {
            steps {
                        sh 'mkdir -p reports'

                sh 'npm test'
                
                // Archivage des résultats des tests
                junit 'reports/junit.xml'
                archiveArtifacts 'coverage/**/*'
            }
        }

        // Étape 4 - Build Docker
        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }

        // Étape 5 - Exécution du conteneur
        stage('Run Container') {
            steps {
                script {
                    sh "docker stop ${APP_NAME} || true"
                    sh "docker rm ${APP_NAME} || true"
                    sh "docker run -d -p 3000:3000 --name ${APP_NAME} ${DOCKER_IMAGE}"
                }
            }
        }
    }

    post {
        always {
            echo 'Nettoyage des ressources...'
            sh 'docker container prune -f'
            sh 'docker image prune -f --filter "until=24h"'
                    // Archive toujours les résultats même en cas d'échec   
            cleanWs()
        }
        success {
            echo 'SUCCÈS : Pipeline exécuté avec succès!'
            echo "L'application est disponible sur http://localhost:3000"
        }
        failure {
            echo 'ÉCHEC : Le pipeline a rencontré une erreur'
        }
    }
}