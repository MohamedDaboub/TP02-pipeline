pipeline {
    agent any

    environment {
        DOCKER_HUB = credentials('docker-hub-credentials')
    }

    stages {
        stage('Clone') {
            steps {
                git branch: 'main',
                url: 'https://github.com/MohamedDaboub/TP02-pipeline.git'
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                script {
                    docker.build("MohamedDaboub/TP02-pipeline:${env.BUILD_ID}")
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        docker.image("MohamedDaboub/TP02-pipeline:${env.BUILD_ID}").push()
                    }
                }
            }
        }

        stage('Deploy to test') {
            steps {
                sh 'docker stop mon-app-node || true'
                sh 'docker rm mon-app-node || true'
                sh 'docker run -d -p 3000:3000 --name mon-app-node MohamedDaboub/TP02-pipeline:${env.BUILD_ID}'
            }
        }
    }

    post {
        always {
            node {
                echo 'Nettoyage après build...'
                sh 'docker system prune -f || true'
            }
        }
        success {
            echo 'Pipeline exécuté avec succès!'
        }
        failure {
            echo 'Échec du pipeline!'
        }
    }
}