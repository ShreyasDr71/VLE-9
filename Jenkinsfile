pipeline {
  agent any

  environment {
    IMAGE = 'devsecops-app:latest'
  }

  stages {
    stage('SAST') {
      steps {
        withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
          sh 'sonar-scanner -Dsonar.host.url=http://localhost:9000 -Dsonar.token=$SONAR_TOKEN'
        }
      }
    }

    stage('Build') {
      steps {
        sh 'docker build -t $IMAGE .'
      }
    }

    stage('Security Scan') {
      steps {
        // Fails the build if any CRITICAL vulnerability with a fix is found
        sh 'trivy image --severity HIGH,CRITICAL --ignore-unfixed $IMAGE'
        sh 'trivy image --severity CRITICAL --ignore-unfixed --exit-code 1 $IMAGE'
      }
    }

    stage('Deploy') {
      steps {
        sh 'docker save $IMAGE | docker exec -i minikube ctr -n k8s.io images import -'
        sh 'kubectl apply -f k8s/'
        sh 'kubectl rollout restart deployment/devsecops-app'
        sh 'kubectl rollout status deployment/devsecops-app --timeout=120s'
      }
    }

    stage('DAST') {
      steps {
        sh '''
          NODE_IP=$(kubectl get node minikube -o jsonpath='{.status.addresses[?(@.type=="InternalIP")].address}')
          mkdir -p zap && chmod 777 zap
          docker run --rm --network host -v "$PWD/zap:/zap/wrk:rw" zaproxy/zap-stable \
            zap-baseline.py -t "http://$NODE_IP:30080" -r zap-report.html -I
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'zap/zap-report.html', allowEmptyArchive: true
    }
  }
}
