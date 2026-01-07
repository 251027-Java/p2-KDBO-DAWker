pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Unit Tests') {
            steps {
                script {
                    // Find all Maven services (directories with pom.xml)
                    def services = sh(
                        script: "find . -maxdepth 4 -name pom.xml -exec dirname {} \\;",
                        returnStdout: true
                    ).trim().split('\n')

                    for (service in services) {
                        echo "Running unit tests in ${service}"

                        dir(service) {
                            if (fileExists('mvnw')) {
                                sh '''
                                    chmod +x mvnw
                                    sed -i 's/\r$//' mvnw
                                    ./mvnw clean test
                                '''
                            } else {
                                sh 'mvn clean test'
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline completed.'
        }
        success {
            echo 'Pipeline succeeded!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}