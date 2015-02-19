var env, store, adapter;
var run = Ember.run;
var passedUrl, passedVerb, passedHash;

var User, Post, Comment, Handle, GithubHandle, TwitterHandle, Company, DevelopmentShop, DesignStudio;

module('integration/adapter/json-api-adapter - JSONAPIAdapter', {
  setup: function() {
    User = DS.Model.extend({
      firstName: DS.attr('string'),
      lastName: DS.attr('string'),
      posts: DS.hasMany('post', { async: true }),
      handles: DS.hasMany('handle', { async: true, polymorphic: true }),
      company: DS.belongsTo('company', { async: true, polymorphic: true })
    });

    Post = DS.Model.extend({
      title: DS.attr('string'),
      author: DS.belongsTo('user', { async: true }),
      comments: DS.hasMany('comment', { async: true })
    });

    Comment = DS.Model.extend({
      text: DS.attr('string'),
      post: DS.belongsTo('post', { async: true })
    });

    Handle = DS.Model.extend({
      user: DS.belongsTo('post', { async: true })
    });

    GithubHandle = Handle.extend({
      username: DS.attr('string')
    });

    TwitterHandle = Handle.extend({
      nickname: DS.attr('string')
    });

    Company = DS.Model.extend({
      name: DS.attr('string'),
      employees: DS.hasMany('user', { async: true })
    });

    DevelopmentShop = Company.extend({
      coffee: DS.attr('boolean')
    });

    DesignStudio = Company.extend({
      hipsters: DS.attr('number')
    });

    env = setupStore({
      adapter: DS.JSONAPIAdapter,

      user: User,
      post: Post,
      comment: Comment,
      handle: Handle,
      githubHandle: GithubHandle,
      twitterHandle: TwitterHandle,
      company: Company,
      developmentShop: DevelopmentShop,
      designStudio: DesignStudio
    });

    store = env.store;
    adapter = env.adapter;
  },

  teardown: function() {
    run(env.store, 'destroy');
  }
});

function ajaxResponse(responses) {
  var counter = 0;
  var index;

  passedUrl = [];
  passedVerb = [];
  passedHash = [];

  adapter.ajax = function(url, verb, hash) {
    index = counter++;

    passedUrl[index] = url;
    passedVerb[index] = verb;
    passedHash[index] = hash;

    return run(Ember.RSVP, 'resolve', responses[index]);
  };
}

test('find a single record', function() {
  expect(3);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks"
    }
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');
    });
  });
});

test('find all records with sideloaded relationships', function() {
  expect(9);

  ajaxResponse([{
    data: [{
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        author: {
          type: "user",
          id: "3"
        }
      }
    }, {
      type: "post",
      id: "2",
      title: "Tompster rules",
      links: {
        author: {
          type: "user",
          id: "3"
        },
        comments: {
          type: "comment",
          ids: ["4", "5"]
        }
      }
    }],
    included: [{
      type: "user",
      id: "3",
      'first-name': "Yehuda",
      'last-name': "Katz"
    }, {
      type: "comment",
      id: "4",
      text: "This is the first comment"
    }, {
      type: "comment",
      id: "5",
      text: "This is the second comment"
    }]
  }]);

  run(function() {
    store.find('post').then(function(posts) {
      equal(passedUrl[0], '/post');

      equal(posts.get('length'), '2');
      equal(posts.get('firstObject.title'), 'Ember.js rocks');
      equal(posts.get('lastObject.title'), 'Tompster rules');

      equal(posts.get('firstObject.author.firstName'), 'Yehuda');
      equal(posts.get('lastObject.author.lastName'), 'Katz');

      equal(posts.get('firstObject.comments.length'), 0);

      equal(posts.get('lastObject.comments.firstObject.text'), 'This is the first comment');
      equal(posts.get('lastObject.comments.lastObject.text'), 'This is the second comment');
    });
  });
});

test('find many records', function() {
  expect(4);

  ajaxResponse([{
    data: [{
      type: "post",
      id: "1",
      title: "Ember.js rocks"
    }]
  }]);

  run(function() {
    store.find('post', { filter: { id: 1 } }).then(function(posts) {
      equal(passedUrl[0], '/post');
      deepEqual(passedHash[0], { data: { filter: { id: 1 } } });

      equal(posts.get('length'), '1');
      equal(posts.get('firstObject.title'), 'Ember.js rocks');
    });
  });
});

test('find a single record with belongsTo link as string', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        author: "http://example.com/post/1/author"
      }
    }
  }, {
    data: {
      type: "user",
      id: "2",
      'first-name': 'Yehuda',
      'last-name': 'Katz'
    }
  }]);


  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('author').then(function(author) {
        equal(passedUrl[1], 'http://example.com/post/1/author');

        equal(author.get('id'), '2');
        equal(author.get('firstName'), 'Yehuda');
        equal(author.get('lastName'), 'Katz');
      });
    });
  });
});

test('find a single record with belongsTo link as object { resource }', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        author: {
          resource: "http://example.com/user/2"
        }
      }
    }
  }, {
    data: {
      type: "user",
      id: "2",
      'first-name': 'Yehuda',
      'last-name': 'Katz'
    }
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('author').then(function(author) {
        equal(passedUrl[1], 'http://example.com/user/2');

        equal(author.get('id'), '2');
        equal(author.get('firstName'), 'Yehuda');
        equal(author.get('lastName'), 'Katz');
      });
    });
  });
});

test('find a single record with belongsTo link as object { type, id }', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        author: {
          type: "user",
          id: "2"
        }
      }
    }
  }, {
    data: {
      type: "user",
      id: "2",
      'first-name': 'Yehuda',
      'last-name': 'Katz'
    }
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('author').then(function(author) {
        equal(passedUrl[1], '/user/2');

        equal(author.get('id'), '2');
        equal(author.get('firstName'), 'Yehuda');
        equal(author.get('lastName'), 'Katz');
      });
    });
  });
});

test('find a single record with belongsTo link as object { type, id } (polymorphic)', function() {
  expect(8);

  ajaxResponse([{
    data: {
      type: "user",
      id: "1",
      'first-name': "Yehuda",
      'last-name': "Katz",
      links: {
        company: {
          type: "development-shop",
          id: "2"
        }
      }
    }
  }, {
    data: {
      type: "development-shop",
      id: "2",
      name: 'Tilde',
      coffee: true
    }
  }]);

  run(function() {
    store.find('user', 1).then(function(user) {
      equal(passedUrl[0], '/user/1');

      equal(user.get('id'), '1');
      equal(user.get('firstName'), 'Yehuda');
      equal(user.get('lastName'), 'Katz');

      user.get('company').then(function(company) {
        equal(passedUrl[1], '/development-shop/2');

        equal(company.get('id'), '2');
        equal(company.get('name'), 'Tilde');
        equal(company.get('coffee'), true);
      });
    });
  });
});

test('find a single record with sideloaded belongsTo link as object { type, id }', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        author: {
          type: "user",
          id: "2"
        }
      }
    },
    included: [{
      type: "user",
      id: "2",
      'first-name': 'Yehuda',
      'last-name': 'Katz'
    }]
  }]);

  run(function() {

    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('author').then(function(author) {
        equal(passedUrl.length, 1);

        equal(author.get('id'), '2');
        equal(author.get('firstName'), 'Yehuda');
        equal(author.get('lastName'), 'Katz');
      });
    });
  });
});

test('find a single record with hasMany link as string', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        comments: "http://example.com/post/1/comments"
      }
    }
  }, {
    data: [{
      type: "comment",
      id: "2",
      text: "This is the first comment"
    }, {
      type: "comment",
      id: "3",
      text: "This is the second comment"
    }]
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('comments').then(function(comments) {
        equal(passedUrl[1], 'http://example.com/post/1/comments');

        equal(comments.get('length'), 2);
        equal(comments.get('firstObject.text'), 'This is the first comment');
        equal(comments.get('lastObject.text'), 'This is the second comment');
      });
    });
  });
});

test('find a single record with hasMany link as object { type, ids }', function() {
  expect(8);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        comments: {
          type: "comment",
          ids: ["2", "3"]
        }
      }
    }
  }, {
    data: {
      type: "comment",
      id: "2",
      text: "This is the first comment"
    }
  }, {
    data: {
      type: "comment",
      id: "3",
      text: "This is the second comment"
    }
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('comments').then(function(comments) {
        equal(passedUrl[1], '/comment/2');
        equal(passedUrl[2], '/comment/3');

        equal(comments.get('length'), 2);
        equal(comments.get('firstObject.text'), 'This is the first comment');
        equal(comments.get('lastObject.text'), 'This is the second comment');
      });
    });
  });
});

test('find a single record with hasMany link as object { data }  (polymorphic)', function() {
  expect(9);

  ajaxResponse([{
    data: {
      type: "user",
      id: "1",
      'first-name': "Yehuda",
      'last-name': "Katz",
      links: {
        handles: {
          data: [{
            "type": "github-handle",
            "id": "2"
          }, {
            "type": "twitter-handle",
            "id": "3"
          }]
        }
      }
    }
  }, {
    data: {
      type: "github-handle",
      id: "2",
      username: "wycats"
    }
  }, {
    data: {
      type: "twitter-handle",
      id: "3",
      nickname: "@wycats"
    }
  }]);

  run(function() {
    store.find('user', 1).then(function(user) {
      equal(passedUrl[0], '/user/1');

      equal(user.get('id'), '1');
      equal(user.get('firstName'), 'Yehuda');
      equal(user.get('lastName'), 'Katz');

      user.get('handles').then(function(handles) {
        equal(passedUrl[1], '/github-handle/2');
        equal(passedUrl[2], '/twitter-handle/3');

        equal(handles.get('length'), 2);
        equal(handles.get('firstObject.username'), 'wycats');
        equal(handles.get('lastObject.nickname'), '@wycats');
      });
    });
  });
});

test('find a single record with sideloaded hasMany link as object { type, ids }', function() {
  expect(7);

  ajaxResponse([{
    data: {
      type: "post",
      id: "1",
      title: "Ember.js rocks",
      links: {
        comments: {
          type: "comment",
          ids: ["2", "3"]
        }
      }
    },
    included: [{
      type: "comment",
      id: "2",
      text: "This is the first comment"
    }, {
      type: "comment",
      id: "3",
      text: "This is the second comment"
    }]
  }]);

  run(function() {
    store.find('post', 1).then(function(post) {
      equal(passedUrl[0], '/post/1');

      equal(post.get('id'), '1');
      equal(post.get('title'), 'Ember.js rocks');

      post.get('comments').then(function(comments) {
        equal(passedUrl.length, 1);

        equal(comments.get('length'), 2);
        equal(comments.get('firstObject.text'), 'This is the first comment');
        equal(comments.get('lastObject.text'), 'This is the second comment');
      });
    });
  });
});

test('find a single record with sideloaded hasMany link as object { data } (polymorphic)', function() {
  expect(8);

  ajaxResponse([{
    data: {
      type: "user",
      id: "1",
      'first-name': "Yehuda",
      'last-name': "Katz",
      links: {
        handles: {
          data: [{
            "type": "github-handle",
            "id": "2"
          }, {
            "type": "twitter-handle",
            "id": "3"
          }]
        }
      }
    },
    included: [{
      type: "github-handle",
      id: "2",
      username: "wycats"
    }, {
      type: "twitter-handle",
      id: "3",
      nickname: "@wycats"
    }]
  }]);

  run(function() {
    store.find('user', 1).then(function(user) {
      equal(passedUrl[0], '/user/1');

      equal(user.get('id'), '1');
      equal(user.get('firstName'), 'Yehuda');
      equal(user.get('lastName'), 'Katz');

      user.get('handles').then(function(handles) {
        equal(passedUrl.length, 1);

        equal(handles.get('length'), 2);
        equal(handles.get('firstObject.username'), 'wycats');
        equal(handles.get('lastObject.nickname'), '@wycats');
      });
    });
  });
});

test('create record', function() {
  expect(3);

  ajaxResponse([{
    data: {
      type: "post",
      id: "4"
    }
  }]);

  run(function() {
    var user = store.push('user', store.normalize('user', {
      id: 1,
      firstName: "Yehuda",
      lastName: "Katz"
    }));

    var comment1 = store.push('comment', store.normalize('comment', {
      id: 2,
      text: "This is the first comment comment"
    }));

    var comment2 = store.push('comment', store.normalize('comment', {
      id: 3,
      text: "This is the second comment"
    }));

    var post = store.createRecord('post', {
      title: 'Ember.js rocks',
      author: user
    });

    post.get('comments').then(function(comments) {
      comments.addObject(comment1);
      comments.addObject(comment2);

      post.save().then(function() {
        equal(passedUrl[0], '/post');
        equal(passedVerb[0], 'POST');
        deepEqual(passedHash[0], {
          data: {
            data : {
              type: "post",
              title: "Ember.js rocks",
              links: {
                author: { type: "user", id: "1" },
                comments: {
                  data: [
                    { type: "comment", id: "2" },
                    { type: "comment", id: "3" }
                  ]
                }
              }
            }
          }
        });
      });
    });
  });
});

test('update record', function() {
  expect(3);

  ajaxResponse([{
    data: {
      type: "post",
      id: "4"
    }
  }]);

  run(function() {
    var user = store.push('user', store.normalize('user', {
      id: 1,
      firstName: "Yehuda",
      lastName: "Katz"
    }));

    var comment1 = store.push('comment', store.normalize('comment', {
      id: 2,
      text: "This is the first comment comment"
    }));

    var comment2 = store.push('comment', store.normalize('comment', {
      id: 3,
      text: "This is the second comment"
    }));

    var post = store.push('post', store.normalize('post', {
      id: 4,
      title: 'Original title'
    }));

    post.set('title', 'Ember.js rocks');
    post.set('author', user);

    post.get('comments').then(function(comments) {
      comments.addObject(comment1);
      comments.addObject(comment2);

      post.save().then(function() {
        equal(passedUrl[0], '/post/4');
        equal(passedVerb[0], 'PUT');
        deepEqual(passedHash[0], {
          data: {
            data : {
              type: "post",
              id: "4",
              title: "Ember.js rocks",
              links: {
                author: { type: "user", id: "1" },
                comments: {
                  data: [
                    { type: "comment", id: "2" },
                    { type: "comment", id: "3" }
                  ]
                }
              }
            }
          }
        });
      });

    });
  });
});
