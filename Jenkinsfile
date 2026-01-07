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
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE build') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% build')
                }
            }
        }

        stage('Start Database') {
            steps {
                script {
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE up -d db') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% up -d db')
                    // Wait until PostgreSQL is healthy
                    isUnix() ? sh('''
                        echo "Waiting for PostgreSQL to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} dawker-db)" == "healthy" ]; do
                            sleep 5
                        done
                    ''') : bat('powershell -Command "Write-Host \"Waiting for PostgreSQL to be healthy...\"; while ((docker inspect -f {{.State.Health.Status}} dawker-db) -ne \"healthy\") { Start-Sleep -Seconds 5 }"')
                }
            }
        }

        stage('Start Kafka & Zookeeper') {
            steps {
                script {
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE up -d zookeeper kafka') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% up -d zookeeper kafka')
                    // Wait for Kafka to be healthy
                    isUnix() ? sh('''
                        echo "Waiting for Kafka to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} kafka)" == "healthy" ]; do
                            sleep 5
                        done
                    ''') : bat('powershell -Command "Write-Host \"Waiting for Kafka to be healthy...\"; while ((docker inspect -f {{.State.Health.Status}} kafka) -ne \"healthy\") { Start-Sleep -Seconds 5 }"')
                }
            }
        }

        stage('Start Backend') {
            steps {
                script {
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE up -d backend') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% up -d backend')
                    // Wait until Spring Boot backend is healthy
                    isUnix() ? sh('''
                        echo "Waiting for backend to be healthy..."
                        until [ "$(docker inspect -f {{.State.Health.Status}} dawker-backend)" == "healthy" ]; do
                            sleep 10
                        done
                    ''') : bat('powershell -Command "Write-Host \"Waiting for backend to be healthy...\"; while ((docker inspect -f {{.State.Health.Status}} dawker-backend) -ne \"healthy\") { Start-Sleep -Seconds 10 }"')
                }
            }
        }

        stage('Start Frontend') {
            steps {
                script {
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE up -d frontend') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% up -d frontend')
                }
            }
        }

        stage('Start Log Consumer') {
            steps {
                script {
                    isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE up -d log-consumer') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% up -d log-consumer')
                }
            }
        }

        stage('Verify Services') {
            steps {
                script {
                    isUnix() ? sh('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"') : bat('docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"')
                }
            }
        }
    }

    post {
        always {
            echo 'Stopping all containers...'
            isUnix() ? sh('docker-compose -f $DOCKER_COMPOSE_FILE down') : bat('docker-compose -f %DOCKER_COMPOSE_FILE% down')
        }
    }
}
