FROM nginx:latest
RUN rm /etc/nginx/conf.d/default.conf
#ADD test-site.local.conf /etc/nginx/conf.d/test-site.local.conf

ADD trcorp.local.conf /etc/nginx/conf.d/trcorp.local.conf
#RUN sh -c "ln -s /etc/nginx/sites-available/trcorp.local.conf /etc/nginx/sites-enabled/trcorp.local.conf"

RUN apt-get update
RUN apt-get install -y mc nano mysql-client

#RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -
#RUN apt-get install -y nodejs
#WORKDIR /app
#CMD npm install
CMD nginx -g 'daemon off;'
#RUN mysql -u test-site.local -p123456 -h db test-site.local < /tmp/dump.sql