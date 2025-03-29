pipeline {
    agent any

    environment {
        APP_NAME = "mon-app-node"
        DOCKER_IMAGE = "${APP_NAME}:${env.BUILD_ID}"
    }

    stages {
       
        stage('Clone Repository') {
            steps {
                git url: 'https://github.com/MohamedDaboub/TP02-pipeline.git', 
                branch: 'main'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build(DOCKER_IMAGE)
                }
            }
        }

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
            echo 'Nettoyage...'
            // Supprime les conteneurs arrêtés
            sh 'docker container prune -f'
            
            // Nettoyage de l'espace de travail Jenkins
            cleanWs()
        }
        success {
            echo 'Application disponible sur http://localhost:3000'
        }
    }
}