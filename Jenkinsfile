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

        // Étape 4 - Build Docker
        stage('Build Docker Image') {
            when {
                expression { isUnix() }
            }
            steps {
                script {
                    try {
                        docker.build(DOCKER_IMAGE)
                    } catch(err) {
                        echo "Docker build skipped: ${err}"
                    }
                }
            }
        }

        // Étape 5 - Exécution du conteneur
        stage('Run Container') {
            when {
                expression { isUnix() && fileExists('/usr/bin/docker') }
            }
            steps {
                script {
                    sh """
                    docker stop ${APP_NAME} || true
                    docker rm ${APP_NAME} || true
                    docker run -d -p 3000:3000 --name ${APP_NAME} ${DOCKER_IMAGE}
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Nettoyage des ressources...'
            script {
                if (isUnix() && fileExists('/usr/bin/docker')) {
                    sh 'docker container prune -f || true'
                }
            }
            cleanWs()
        }
        success {
            echo 'SUCCÈS : Pipeline exécuté avec succès!'
        }
        failure {
            echo 'ÉCHEC : Le pipeline a rencontré une erreur'
        }
    }
}