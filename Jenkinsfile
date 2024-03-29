pipeline {
    agent any

    tools {
        nodejs "nodejs"
    }

    stages {
        stage('Cleanup') {
            steps {
                script {
                    try {
                         bat '''
                            docker compose down     
                            docker rmi f21ao-cw-authentication f21ao-cw-patient-registration f21ao-cw-lab-operations
                        '''
                    } catch (Exception e) { }
                }
                echo 'Cleaning up..'
            }
        }
        stage('Dependency Installation') {
            parallel {
                stage('Install Auth Dependencies') {
                    steps {
                        bat '''
                            cd authentication-service
                            npm install
                        '''
                    }
                }
                stage('Install Patient Registration Dependencies') {
                    steps {
                        bat '''
                            cd patientRegistration
                            npm install 
                        '''
                    }
                }
                stage('Install Lab Operation Dependencies') {
                    steps {
                        bat '''
                            cd laboperations
                            npm install
                        '''
                    }
                }
            }
        }
        stage('Security Testing') {
            environment {
                scanner = tool 'sonarscan'
            }
            steps {
                withSonarQubeEnv(installationName: 'SonarQubeServer') {
                    bat '''
                        %scanner%\\bin\\sonar-scanner.bat
                    '''
                }
            }
        }
        stage('Unit Testing') {
            steps {
                bat '''
                    cd authentication-service
                    npm run test
                    cd ../patientRegistration
                    npm run test
                    cd ../laboperations
                    npm run test
                '''
            }
        }
        stage('Docker Containers Building') {
            steps {
                bat '''
                    docker compose build
                '''
            }
        }
        stage('Deployment') {
            steps {
                bat '''
                   kubectl apply -f k8s/authentication-deployment.yaml
                   kubectl apply -f k8s/authentication-service.yaml
                   kubectl apply -f k8s/lab-operations-deployment.yaml
                   kubectl apply -f k8s/lab-operations-service.yaml
                   kubectl apply -f k8s/patient-registration-deployment.yaml
                   kubectl apply -f k8s/patient-registration-service.yaml
                '''
            }
        }
    }
}