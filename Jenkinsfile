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
                                    sed -i 's/\\r$//' mvnw
                                '''
                            }

                            // Extract Java version from pom.xml
                            def javaVer = sh(
                                script: "xmllint --xpath \"//*[local-name()='plugin'][*//*[local-name()='artifactId']='maven-compiler-plugin']/*[local-name()='configuration']/*[local-name()='release']/text()\" pom.xml 2>/dev/null || echo 20",
                                returnStdout: true
                            ).trim()
                            if (!javaVer) {
                                javaVer = '20'
                            }
                            echo "Detected Java version: ${javaVer}"

                            def fallbackVersions = [javaVer, '21', '20', '17']
                            def success = false

                            for (ver in fallbackVersions) {
                                echo "Trying Java ${ver}"
                                try {
                                    sh """
                                        docker run --rm -v \$PWD:/app -w /app maven:3.9-eclipse-temurin-${ver}-alpine \
                                        bash -c "\${fileExists('mvnw') ? './mvnw clean test' : 'mvn clean test'}"
                                    """
                                    success = true
                                    break
                                } catch (err) {
                                    echo "Java ${ver} failed: ${err}"
                                }
                            }

                            if (!success) {
                                error "Unit tests failed for ${service} on all tried Java versions."
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
            echo 'Pipeline failed.'
        }
    }
}
