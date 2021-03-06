/**
 * carcassonne-scoreboard-client
 *
 * @author    Andrea Sonny <andreasonny83@gmail.com>
 * @license   MIT
 *
 * https://andreasonny.mit-license.org/
 *
 */
(function() {
    'use strict';

    angular
        .module('app')
        .controller('MainController', MainController);

    MainController.$inject = ['$scope', '$routeParams', '$http', '$mdToast', 'socket', '$location'];

    /* @ngInject */
    function MainController($scope, $routeParams, $http, $mdToast, socket, $location) {
      var vm = this;

      vm.app = {
        users_online: '-',
        games: '-'
      };

      vm.goTo = function(path) {
        $location.path(path);
      }

      function setCookie(cname, cvalue, exhours) {
          var d = new Date();
          d.setTime(d.getTime() + (exhours*60*60*1000));
          var expires = "expires="+d.toUTCString();
          document.cookie = cname + "=" + cvalue + "; " + expires;
      }

      function getCookie(cname) {
          var name = cname + "=";
          var ca = document.cookie.split(';');
          for(var i=0; i<ca.length; i++) {
              var c = ca[i];
              while (c.charAt(0)==' ') c = c.substring(1);
              if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
          }
          return false;
      }

      // Socket listeners
      // ================

      // generate a randon user unique id to store in the cookies
      // in order to keep the connection alive
      if (! getCookie('userUniqueId') ) {
        var randomlyGeneratedUID = Math.random().toString(36).substring(3,16) + +new Date;
        setCookie('userUniqueId', randomlyGeneratedUID, 24);
      }

      // Register the user once the server connection is established
      socket.on('init', function () {
        console.log('received: init');
        socket.emit('register', getCookie('userUniqueId') );
      });

      socket.on('registered', function (data) {
        console.log('received: register');
        $mdToast.showSimple('You are now logged in.');
      });

      socket.on('ping', function (user_id) {
        if ( ! user_id ) return;

        var my_id = getCookie('userUniqueId');

        if ( my_id === user_id) {
          socket.emit('pong', my_id );
        }
      });

      socket.on('app:update', function (data) {
        // console.log('received: app:update');
        vm.app.users_online = data.users;
        vm.app.games = data.games;
      });
    }
})();
