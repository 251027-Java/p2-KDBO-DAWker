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
                            // Prepare Maven wrapper if it exists
                            if (fileExists('mvnw')) {
                                sh '''
                                    chmod +x mvnw
                                    sed -i 's/\\r$//' mvnw
                                '''
                            }

                            // Extract Java version from pom.xml (maven-compiler-plugin release)
                            def javaVer = sh(
                                script: """
                                    xmllint --xpath "//*[local-name()='plugin'][*//*[local-name()='artifactId']='maven-compiler-plugin']/*[local-name()='configuration']/*[local-name()='release']/text()" pom.xml || echo '20'
                                """,
                                returnStdout: true
                            ).trim()

                            if (javaVer == '') {
                                javaVer = '20' // default if not found
                            }

                            echo "Detected Java version for ${service}: ${javaVer}"

                            // Run tests in Docker Maven container
                            try {
                                sh """
                                    docker run --rm -v \$PWD:/app -w /app maven:3.9-eclipse-temurin-${javaVer}-alpine \
                                    bash -c "\${fileExists('mvnw') ? './mvnw clean test' : 'mvn clean test'}"
                                """
                            } catch (err) {
                                error "Unit tests failed for ${service} using Java ${javaVer}: ${err}"
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
