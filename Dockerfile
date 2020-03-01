FROM balenalib/raspberrypi3-64-alpine-node:latest
RUN [ "cross-build-start" ]
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
ENV PUBLIC_URL /
COPY package.json /app/package.json
RUN yarn
COPY . .
EXPOSE 3000 
CMD ["yarn", "start:prod"]
RUN [ "cross-build-end" ]
