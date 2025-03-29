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

        // Étape 3 - Exécution des tests
        stage('Run Tests') {
            steps {
        sh 'mkdir -p test-results/junit'
        
        // Exécute les tests
        sh 'npm test'
        
        // Vérifie que le fichier a bien été créé (pour debug)
        sh 'ls -la test-results/junit/ || true'
        
        // Archive les résultats
        junit 'test-results/junit/junit.xml'
        archiveArtifacts 'coverage/**/*'
            }
        }

        // Étape 4 - Build Docker (seulement si Docker est installé)
        stage('Build Docker Image') {
            when {
                expression { isUnix() } // S'exécute seulement sur les agents Unix
            }
            steps {
                script {
                    try {
                        docker.build(DOCKER_IMAGE)
                    } catch (err) {
                        echo "WARNING: Docker build failed - ${err}"
                    }
                }
            }
        }

        // Étape 5 - Exécution du conteneur (optionnelle)
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
            // Vérifie l'existence des fichiers avant de les archiver
            if (fileExists('test-results/junit/junit.xml')) {
                junit 'test-results/junit/junit.xml'
            } else {
                echo "Avertissement: Fichier JUnit non trouvé"
                sh 'find . -name "junit.xml" || true'  // Debug pour localiser le fichier
            }
            
            if (fileExists('coverage/lcov.info')) {
                archiveArtifacts 'coverage/**/*'
            }
            }
            cleanWs()
        }
        success {
            echo 'SUCCÈS : Pipeline exécuté avec succès!'
            echo "Application disponible sur http://localhost:3000 (si déployée)"
        }
        failure {
            echo 'ÉCHEC : Le pipeline a rencontré une erreur'
        }
    }
}