pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        NODE_ENV = 'production'
        // Set these as Jenkins credentials/environment variables:
        // CONVEX_DEPLOYMENT
        // CONVEX_DEPLOYMENT_KEY
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing root project dependencies...'
                    sh 'npm ci'
                    
                    echo 'Installing os.arcbase.one dependencies...'
                    sh 'cd os.arcbase.one && npm ci && cd ..'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    echo 'Building main project...'
                    sh 'npm run build'
                    
                    echo 'Building os.arcbase.one...'
                    sh 'cd os.arcbase.one && npm run build && cd ..'
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                script {
                    echo 'Archiving build artifacts...'
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true, allowEmptyArchive: true
                    archiveArtifacts artifacts: 'os.arcbase.one/dist/**/*', fingerprint: true, allowEmptyArchive: true
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build successful!'
            // Optional: Send success notification
        }
        failure {
            echo 'Build failed!'
            // Optional: Send failure notification
        }
    }
}
