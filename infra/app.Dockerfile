FROM seanmorris/subspace-web

# RUN docker-php-ext-install pdo pdo_mysql
# RUN docker-php-ext-install bcmath 

CMD ["apache2-foreground"]
