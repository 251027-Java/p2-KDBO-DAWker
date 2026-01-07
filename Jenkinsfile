pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE build'
                }
            }
        }

        stage('Start Database') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d db'
                    // Wait until PostgreSQL is healthy
                    sh '''
                        echo "Waiting for PostgreSQL to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} dawker-db)" == "healthy" ]; do
                            sleep 5
                        done
                    '''
                }
            }
        }

        stage('Start Backend') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d backend'
                    // Wait until Spring Boot backend is healthy
                    sh '''
                        echo "Waiting for backend to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} dawker-backend)" == "healthy" ]; do
                            sleep 10
                        done
                    '''
                }
            }
        }

        stage('Start Frontend') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d frontend'
                }
            }
        }

        stage('Start Kafka & Zookeeper') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d zookeeper kafka'
                    // Wait for Kafka to be healthy
                    sh '''
                        echo "Waiting for Kafka to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} kafka)" == "healthy" ]; do
                            sleep 5
                        done
                    '''
                }
            }
        }

        stage('Start Log Consumer') {
            steps {
                script {
                    sh 'docker-compose -f $DOCKER_COMPOSE_FILE up -d log-consumer'
                }
            }
        }

        stage('Verify Services') {
            steps {
                script {
                    sh 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
                }
            }
        }
    }

    post {
        always {
            echo 'Stopping all containers...'
            sh 'docker-compose -f $DOCKER_COMPOSE_FILE down'
        }
    }
}
