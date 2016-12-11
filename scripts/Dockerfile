FROM nodesource/jessie:4.4.7

RUN apt-get update
RUN apt-get install git

RUN useradd -ms /bin/bash blogbuilder
USER blogbuilder
WORKDIR /home/blogbuilder

RUN npm i npm -g
RUN npm i yarn -g

RUN git clone https://github.com/impaler/cd-blog-phenomic.git cd-blog-phenomic

WORKDIR /home/blogbuilder/cd-blog-phenomic
RUN npm --production=false install

EXPOSE 3000
CMD "ip add | grep global"
ENTRYPOINT ["/usr/bin/npm", "run-script"]