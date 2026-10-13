# Minimal base image
FROM node:22-alpine

WORKDIR /app
COPY package.json app.js ./

# Run as a non-root user (numeric UID so Kubernetes can verify runAsNonRoot)
RUN adduser -D -u 10001 appuser
USER 10001

EXPOSE 3000
CMD ["node", "app.js"]
