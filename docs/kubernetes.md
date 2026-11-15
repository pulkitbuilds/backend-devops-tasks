# Kubernetes pod task

Use minikube or kind locally.

```bash
minikube start

# 1. build the image inside minikube's Docker so the pod can find it
eval $(minikube docker-env)
docker build -t backend-tasks:latest .

# 2. secret with config (use your MongoDB Atlas URI)
kubectl create secret generic backend-secret \
  --from-literal=JWT_SECRET='long-random-string' \
  --from-literal=MONGO_URI='mongodb+srv://user:pass@cluster/dbname'

# 3. create the pod
kubectl apply -f k8s/pod.yaml
kubectl get pods
kubectl describe pod backend-pod
kubectl logs backend-pod

# 4. test it
kubectl port-forward pod/backend-pod 3000:3000
curl http://localhost:3000/health

# optional: expose via a Service
kubectl apply -f k8s/service.yaml
minikube service backend-service --url

# clean up
kubectl delete -f k8s/pod.yaml
```
