pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Run Unit Tests') {
            steps {
                script {
                    // Find all Maven services
                    def services = sh(
                        script: "find . -maxdepth 4 -name pom.xml -exec dirname {} \\;",
                        returnStdout: true
                    ).trim().split('\n')

                    // Determine highest available Java version dynamically
                    def tags = sh(
                        script: "curl -s https://registry.hub.docker.com/v2/repositories/library/maven/tags?page_size=100 | jq -r '.results[].name' | grep 'eclipse-temurin-[0-9]\\+-alpine' | sed -E 's/^3\\.9.*eclipse-temurin-([0-9]+)-alpine$/\\1/'",
                        returnStdout: true
                    ).trim().split('\n')
                    def MAX_JAVA_AVAILABLE = tags ? tags.collect { it.toInteger() }.max() : 21
                    echo "Max available Java version: ${MAX_JAVA_AVAILABLE}"

                    def tested = []
                    def skipped = []

                    for (service in services) {
                        echo "Checking microservice: ${service}"
                        dir(service) {
                            if (fileExists('mvnw')) {
                                sh '''
                                    chmod +x mvnw
                                    sed -i 's/\\r$//' mvnw
                                '''
                            }

                            def javaVer = sh(
                                script: "xmllint --xpath \"//*[local-name()='plugin'][*//*[local-name()='artifactId']='maven-compiler-plugin']/*[local-name()='configuration']/*[local-name()='release']/text()\" pom.xml 2>/dev/null || echo 20",
                                returnStdout: true
                            ).trim()
                            if (!javaVer) { javaVer = '20' }
                            echo "Detected Java version: ${javaVer}"

                            if (javaVer.toInteger() > MAX_JAVA_AVAILABLE) {
                                echo "Skipping ${service}: Java ${javaVer} not supported (max ${MAX_JAVA_AVAILABLE})"
                                skipped << service
                                continue
                            }

                            def success = false
                            for (def ver = javaVer.toInteger(); ver <= MAX_JAVA_AVAILABLE; ver++) {
                                def image = "maven:3.9-eclipse-temurin-${ver}-alpine"
                                try {
                                    sh "docker manifest inspect ${image} >/dev/null 2>&1"
                                    echo "Using Docker image ${image}"
                                    sh "docker run --rm -v \$PWD:/app -w /app ${image} bash -c './mvnw clean test'"
                                    tested << service
                                    success = true
                                    break
                                } catch (err) {
                                    echo "Docker image ${image} not available, skipping."
                                }
                            }

                            if (!success) {
                                echo "Skipping ${service}: no suitable Docker image found"
                                skipped << service
                            }
                        }
                    }

                    echo ""
                    echo "====== Unit Test Summary ======"
                    echo "Tested microservices: ${tested.join(' ')}"
                    echo "Skipped microservices: ${skipped.join(' ')}"
                    echo "==============================="
                }
            }
        }
    }

    post {
        always { echo 'Pipeline completed.' }
        success { echo 'Pipeline succeeded!' }
        failure { echo 'Pipeline failed!' }
    }
}
