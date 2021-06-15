#!/bin/bash


if [ ! $DOCKER_CONFIG_DIR ] ; then 
    export DOCKER_CONFIG_DIR="/usr/local/docker-config" 
fi 


if ! cmp -s "$DOCKER_CONFIG_DIR/httpd/httpd-vhosts.conf" "ui/httpd-vhosts.conf"  ; then
	mv $DOCKER_CONFIG_DIR/httpd/httpd-vhosts.conf $DOCKER_CONFIG_DIR/httpd/httpd-vhosts.conf.`date +%F_%T`
	cp ui/httpd-vhosts.conf $DOCKER_CONFIG_DIR/httpd/httpd-vhosts.conf
fi


