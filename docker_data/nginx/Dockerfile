FROM nginx:latest
RUN rm /etc/nginx/conf.d/default.conf
ADD test-site.local.conf /etc/nginx/conf.d/test-site.local.conf
RUN apt-get update
RUN apt-get install -y mc nano mysql-client

CMD nginx -g 'daemon off;'
#RUN mysql -u test-site.local -p123456 -h db test-site.local < /tmp/dump.sql