var myApp = angular.module('myApp', ['ui.router', 'ngCookies'])

.service('LoggedInServ', function($http, $state, $cookies){
    var loggedIn = $cookies.get('isLoggedIn');
    this.submitLogin = function(username, password){
        var url = 'berlinevents/login';
        var userData = { username, password };
        var jsonData = JSON.stringify(userData);
        return $http.post(url, jsonData)
        .then(function(result){
            // console.log(loggedIn);
            // console.log(result.data);
            console.log('this is successful');
            $cookies.put('isLoggedIn', true);
            loggedIn = true;
            // $state.go('home');
        })
        .catch(function(err){
            console.log(err);
        });
    };
    this.checkIfLoggedIn = function(){
        return loggedIn;

    };
    this.logout = function(){
        loggedIn = false;
        $cookies.remove('isLoggedIn');


    }
    this.registerUser = function(){
        loggedIn = true;
        $cookies.put('isLoggedIn', true);
    }
})

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/berlinevents');
    $stateProvider
    .state('home', {
        url : '/berlinevents',
        templateUrl: '/home.html',
        controller: function($scope, $http, LoggedInServ, $cookies){
            var url = '/berlinevents';
            // var isLoggedIn = LoggedInServ.checkIfLoggedIn();
            console.log('is five');
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            console.log(LoggedInServ.checkIfLoggedIn());
            $scope.test = 'shirin is al';
            $scope.recentLinks = [];

            $http.get(url).then(function(result){
                // console.log(result.data.links);
                $scope.recentLinks = result.data.links;
            });
        }
    })
    .state('login', {
        url : '/login',
        templateUrl: '/login.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies){
            $scope.submitLogin = function(){
                LoggedInServ.submitLogin($scope.username, $scope.password)
                .then(function(){
                    $scope.loggedIn = true;
                    console.log($scope.loggedIn);
                    $state.go('home',{
                        isLoggedIn: true
                    });
                });
            };
                // $scope.submitLogin = function(){
                //     console.log(88888);
                //     var url = 'berlinevents/login';
                //     var username = $scope.username;
                //     var password = $scope.password;
                //     var data = {
                //         username : username,
                //         password : password
                //     };
                //
                //     var jsonData = JSON.stringify(data);
                //     console.log(jsonData);
                //
                //     $http.post(url, jsonData).then(function(result){
                //         console.log(333);
                //         $scope.loggedIn = true;
                //         console.log(result);
                //         $state.go('home');
                //     })
                //     .catch(function(err){
                //         console.log(err);
                //         $scope.notvaliduser = true;
                //     });
                // };
            // }
        }
    })
    .state('signup', {
        url : '/signup',
        templateUrl: '/signup.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies){

            $scope.submitSignUp = function(){
                var url = 'berlinevents/signup';
                var username = $scope.username;
                var email = $scope.email;
                var password = $scope.password;
                var data = {
                    username : username,
                    email : email,
                    password : password
                };
                var jsonData = JSON.stringify(data);
                $http.post(url, jsonData)
                .then(function(result){
                    LoggedInServ.registerUser();
                    $state.go('home',{
                        isLoggedIn: true
                    });
                })
                .catch(function(err){
                    console.log(err);
                });
            };
        }

    })
    /*
    .state('login', {
        url : '/login',
        templateUrl: '/login.html',
        controller: function($scope, $http, $state){
            if ($scope.loggedIn){
                $state.go('home');
            } else {
                delete $scope.linkUpload;
                delete $scope.signup;
                delete $scope.login;
                $scope.login = true;
                console.log($scope.username);

                $scope.submitLogin = function(){
                    console.log(88888);
                    var url = 'berlinevents/login';
                    var username = $scope.username;
                    var password = $scope.password;
                    var data = {
                        username : username,
                        password : password
                    };

                    var jsonData = JSON.stringify(data);
                    console.log(jsonData);

                    $http.post(url, jsonData).then(function(result){
                        console.log(333);
                        $scope.loggedIn = true;
                        console.log(result);
                        $state.go('home');
                    })
                    .catch(function(err){
                        console.log(err);
                        $scope.notvaliduser = true;
                    });
                };
            }
        }
    })
    */
    .state('logout', {
        url : '/logout',
        controller: function($scope, $http, $state, LoggedInServ, $cookies){
            LoggedInServ.logout();
            delete $scope.signedUp;
            delete $scope.loggedIn;
            delete $scope.linkUpload;
            $state.go('home');
        }
    })
    .state('addlink', {
        url : '/addlink',
        templateUrl: '/addlink.html',
        controller: function($scope, $http, $state){
            delete $scope.signup;
            delete $scope.login;
            delete $scope.linkUpload;
            $scope.linkUpload = true;
            $scope.recentLinks = [];
            $scope.link = {};
            var url = '/berlinevents';
            $http.get(url).then(function(result){
                console.log(result.data.links);

                $scope.recentLinks = result.data.links;
            });
            $scope.upload = function(){

                var url = '/berlinevents/link';
                var title = $scope.link.title;
                var link = $scope.link.url;
                console.log(link);
                if (link.substring(0, 4) !== 'http') {
                    link = 'http://' + link;
                }
                var recent =  $scope.recentLinks;
                console.log(recent);
                var matching = recent.some(function(linkToCompare){
                    console.log(link);
                    console.log(linkToCompare.link);
                    return linkToCompare.link == link;
                });

                if (matching) {
                    alert('This link already exists');
                    delete $scope.linkUpload;
                    return;
                }

                var data = {
                    title : title,
                    url : link
                };

                $http.post(url, data).then(function(result){
                    $scope.success = true;
                    $scope.recentLinks.unshift(result.data);
                    $state.go('home');
                });

                delete $scope.linkUpload;
            };
        }
    });
}]);

// myApp.controller('linksUpdate', function($scope, $http) {
//     var url = '/berlinevents';
//     delete $scope.success;
//     delete $scope.linkUpload;
//     delete $scope.recentLinks;
//     $scope.recentLinks = [];
//     $scope.link = {};
//     $http.get(url).then(function(result){
//         console.log(result.data.links);
//
//         $scope.recentLinks = result.data.links;
//     });
//     $scope.addLink = function(){
//         delete $scope.signup;
//         delete $scope.login;
//         delete $scope.linkUpload;
//         $scope.linkUpload = true;
//
//     };
//     $scope.upload = function(){
//         url = '/berlinevents/link';
//         var title = $scope.link.title;
//         var link = $scope.link.url;
//         if (link.substring(0, 4) !== 'http') {
//             link = 'http://' + link;
//         }
//         var recent =  $scope.recentLinks;
//         console.log(recent);
//         var matching = recent.some(function(linkToCompare){
//             console.log(link);
//             console.log(linkToCompare.link);
//             return linkToCompare.link == link;
//         });
//
//         if (matching) {
//             alert('This link already exists');
//             delete $scope.linkUpload;
//             return;
//         }
//
//         var data = {
//             title : title,
//             url : link
//         };
//
//         $http.post(url, data).then(function(result){
//             $scope.success = true;
//             $scope.recentLinks.unshift(result.data);
//         });
//
//         delete $scope.linkUpload;
//     };
// });
