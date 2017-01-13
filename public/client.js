var myApp = angular.module('myApp', ['ui.router', 'ngCookies', 'service.LoggedInServ'])

.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider){
    $urlRouterProvider.otherwise('/berlinevents');
    $stateProvider
    .state('home', {
        url : '/berlinevents',
        templateUrl: '/home.html',
        controller: function($scope, $http, LoggedInServ, $cookies){
            var url = '/berlinevents';
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            // console.log(LoggedInServ.checkIfLoggedIn());
            $scope.recentLinks = [];
            if ($scope.isLoggedIn) {
                LoggedInServ.getUsername().then(function(name){
                    $scope.username = name;
                    $scope.$apply();
                    console.log('this home username' + $scope.username);

                });
            }
            $http.get(url).then(function(result){
                // console.log(result.data.links);
                $scope.recentLinks = result.data.links;
                // console.log($scope.recentLinks);
            });
        }
    })
    .state('login', {
        url : '/login?next&id',
        templateUrl: '/login.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies, $stateParams){
            console.log($stateParams);
            $scope.submitLogin = function(){
                LoggedInServ.submitLogin($scope.username, $scope.password)
                .then(function(){
                    $scope.loggedIn = true;
                    console.log($stateParams);
                    if ($stateParams.next){
                        $state.go($stateParams.next,{
                            id: $stateParams.id,
                            isLoggedIn: true
                        });
                    } else {
                        $state.go('home', {
                            isLoggedIn: true,
                        });
                    }

                });
            };
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
                    console.log(jsonData);
                })
                .catch(function(err){
                    console.log(err);
                });
            };
        }

    })
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
        controller: function($scope, $http, $state, LoggedInServ, $cookies){
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            if ($scope.isLoggedIn) {
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
                };

            } else {
                console.log('test');
                $state.go('login', {
                    next: 'addlink'
                });
            }
        }
    })
    .state('comments', {
        url : '/comment/:id',
        templateUrl: '/comments.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies, $stateParams){
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            if ($scope.isLoggedIn) {
                LoggedInServ.getUsername().then(function(name){
                    $scope.username = name;
                });
                $scope.recentComments = [];
                $scope.comment = {};
                var url = '/link/' + $stateParams.id;

                $http.get(url).then(function(result){
                    console.log(result.data.comments);
                    $scope.recentComments = result.data.comments;
                    $scope.link = result.data.link;
                    $scope.title = result.data.title;
                    // console.log($scope.title);
                    // $scope.parent_id = x;
                    console.log(result);
                });

                $scope.addComment = function(){
                    var url = '/link/' + $stateParams.id;
                    var comment = $scope.comment;
                    console.log(comment);
                    $http.post(url, comment).then(function(result){
                        console.log(result);
                        $scope.recentComments.unshift(result.data);
                        delete $scope.comment.text;
                    });
                };
                $scope.reply = function(commentID){
                    $scope.replysection = commentID;
                };
                $scope.respond = function(comment){
                    delete $scope.replysection;
                    var url = '/link/' + $stateParams.id;
                    var commentData = {
                        text : comment.replyText,
                        parent_id : comment.id
                    };
                    console.log(commentData);
                    $http.post(url, commentData).then(function(result){
                        console.log(result);
                        $scope.responded = true;
                        comment.replies = comment.replies || [];
                        comment.replies.unshift(result.data);
                        delete comment.replyText;
                    });
                };
            } else {
                $state.go('login', {
                    next: 'comments',
                    id: $stateParams.id
                });
            }
        }
    })
    .state('profile', {
        url : '/profile',
        templateUrl: '/profile.html',
        controller: function($scope, $http, $state, LoggedInServ, $cookies){
            $scope.isLoggedIn = LoggedInServ.checkIfLoggedIn();
            if ($scope.isLoggedIn) {
                LoggedInServ.getUsername().then(function(name){
                    $scope.username = name;
                });
            }
            var url = '/getUserinfo';
            $http.get(url).then(function(result){
                $scope.username = result.data.username;
                $scope.email = result.data.email;
                $scope.link = result.data.links;
                $scope.title = result.data.title;
                $scope.comment = result.data.comments;
                console.log(result.data.links);
            });
        }
    });
}]);
