// import setupStore from 'dummy/tests/helpers/store';
// import Ember from 'ember';
//
// import testInDebug from 'dummy/tests/helpers/test-in-debug';
// import {module, test} from 'qunit';
//
// import DS from 'ember-data';
//
// var env, store, Comment, Post, User;
// var get = Ember.get;
// var run = Ember.run;
//
// var attr = DS.attr;
// var hasMany = DS.hasMany;
// var belongsTo = DS.belongsTo;
// var resolve = Ember.RSVP.resolve;
//
// module("integration/relationship/priority", {
//   beforeEach() {
//
//     Comment = DS.Model.extend({
//       body: attr('string'),
//       post: belongsTo('post', { async: true })
//     });
//
//     Post = DS.Model.extend({
//       title: attr('string'),
//       author: belongsTo('user', { async: true }),
//       comments: hasMany('comment', { async: true })
//     });
//
//     User = DS.Model.extend({
//       name: attr('string'),
//       posts: hasMany('post', { async: true })
//     });
//
//     env = setupStore({
//       comment: Comment,
//       post: Post,
//       user: User
//     });
//
//     env.adapter.coalesceFindRequests = false;
//
//     env.registry.optionsForType('serializer', { singleton: false });
//     env.registry.optionsForType('adapter', { singleton: false });
//
//     store = env.store;
//
//     Comment = store.modelFor('comment');
//     Post    = store.modelFor('post');
//     User    = store.modelFor('user');
//   },
//
//   afterEach() {
//     run(env.container, 'destroy');
//   }
// });
//
// test("belongsTo without data, without related link should not return anything", function(assert) {
//   assert.expect(1);
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1'
//       }
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(author, null, 'author is null');
//     });
//   });
// });
//
// test("belongsTo without data, with related link should call findBelongsTo", function(assert) {
//   assert.expect(3);
//
//   env.adapter.findBelongsTo = (store, snapshot, url) => {
//     assert.ok(true, 'findBelongsTo was called');
//     assert.equal(url, '/post/1/author', 'url is correct');
//     return resolve({ id: 2, name: 'This is author' });
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           author: {
//             links: {
//               related: '/post/1/author'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(get(author, 'name'), 'This is author', 'author name is correct');
//     });
//   });
// });
//
// test("belongsTo with data (not included), without related link should call findRecord", function(assert) {
//   assert.expect(2);
//
//   env.adapter.findBelongsTo = () => {
//     assert.ok(false, 'findBelongsTo should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(true, 'findRecord was called');
//     return resolve({ id: 2, name: 'This is author' });
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           author: {
//             data: {
//               type: 'user',
//               id: '2'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(get(author, 'name'), 'This is author', 'author name is correct');
//     });
//   });
// });
//
// test("belongsTo with data (not included), with related link should call findBelongsTo", function(assert) {
//   assert.expect(3);
//
//   env.adapter.findBelongsTo = (store, snapshot, url) => {
//     assert.ok(true, 'findBelongsTo was called');
//     assert.equal(url, '/post/1/author', 'url is correct');
//     return resolve({ id: 2, name: 'This is author' });
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           author: {
//             data: {
//               type: 'user',
//               id: '2'
//             },
//             links: {
//               related: '/post/1/author'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(get(author, 'name'), 'This is author', 'author name is correct');
//     });
//   });
// });
//
// test("belongsTo with data (included), without related link should not call finders", function(assert) {
//   assert.expect(1);
//
//   env.adapter.findBelongsTo = () => {
//     assert.ok(false, 'findBelongsTo should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           author: {
//             data: {
//               type: 'user',
//               id: '2'
//             }
//           }
//         }
//       },
//       included: [{
//         type: 'user',
//         id: '2',
//         attributes: {
//           name: 'This is author'
//         }
//       }]
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(get(author, 'name'), 'This is author', 'author name is correct');
//     });
//   });
// });
//
// test("belongsTo with data (included), with related link should not call finders", function(assert) {
//   assert.expect(1);
//
//   env.adapter.findBelongsTo = () => {
//     assert.ok(false, 'findBelongsTo should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           author: {
//             data: {
//               type: 'user',
//               id: '2'
//             },
//             links: {
//               related: '/post/1/author'
//             }
//           }
//         }
//       },
//       included: [{
//         type: 'user',
//         id: '2',
//         attributes: {
//           name: 'This is author'
//         }
//       }]
//     });
//
//     get(post, 'author').then((author) => {
//       assert.equal(get(author, 'name'), 'This is author', 'author name is correct');
//     });
//   });
// });
//
// test("hasMany without data, without related link should not return anything", function(assert) {
//   assert.expect(1);
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1'
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 0, 'there are no comments');
//     });
//   });
// });
//
// test("hasMany without data, with related link should call findHasMany", function(assert) {
//   assert.expect(5);
//
//   env.adapter.findHasMany = (store, snapshot, url) => {
//     assert.ok(true, 'findHasMany was called');
//     assert.equal(url, '/post/1/comments', 'url is correct');
//     return resolve([
//       { id: 2, body: 'First comment' },
//       { id: 3, body: 'Second comment' },
//     ]);
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             links: {
//               related: '/post/1/comments'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (not included), without related link should call findRecord", function(assert) {
//   assert.expect(5);
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = (store, type, id) => {
//     assert.ok(true, 'findRecord was called'); // should be run 2 times
//     return resolve({ id, body: ({ 2: 'First comment', 3: 'Second comment' })[id] });
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }]
//           }
//         }
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (not included), without related link should call findMany (coalesceFindRequests)", function(assert) {
//   assert.expect(5);
//
//   env.adapter.coalesceFindRequests = true;
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = (store, type, ids, snapshots) => {
//     assert.ok(true, 'findMany was called');
//     assert.deepEqual(ids, ['2', '3'], 'ids are correct');
//     return resolve([
//       { id: 2, body: 'First comment' },
//       { id: 3, body: 'Second comment' },
//     ]);
//   };
//
//   env.adapter.findRecord = (store, type, id) => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }]
//           }
//         }
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (not included), with related link should call findHasMany", function(assert) {
//   assert.expect(5);
//
//   env.adapter.findHasMany = (store, snapshot, url) => {
//     assert.ok(true, 'findHasMany was called');
//     assert.equal(url, '/post/1/comments', 'url is correct');
//     return resolve([
//       { id: 2, body: 'First comment' },
//       { id: 3, body: 'Second comment' },
//     ]);
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }],
//             links: {
//               related: '/post/1/comments'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (not included), with related link should call findHasMany (coalesceFindRequests)", function(assert) {
//   assert.expect(5);
//
//   env.adapter.coalesceFindRequests = true;
//
//   env.adapter.findHasMany = (store, snapshot, url) => {
//     assert.ok(true, 'findHasMany was called');
//     assert.equal(url, '/post/1/comments', 'url is correct');
//     return resolve([
//       { id: 2, body: 'First comment' },
//       { id: 3, body: 'Second comment' },
//     ]);
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = () => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }],
//             links: {
//               related: '/post/1/comments'
//             }
//           }
//         }
//       }
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (included), without related link should not call finders", function(assert) {
//   assert.expect(3);
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = (store, type, id) => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }]
//           }
//         }
//       },
//       included: [{
//         type: 'comment',
//         id: '2',
//         attributes: {
//           body: 'First comment'
//         }
//       }, {
//         type: 'comment',
//         id: '3',
//         attributes: {
//           body: 'Second comment'
//         }
//       }]
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
// test("hasMany with data (included), with related link should not call finders", function(assert) {
//   assert.expect(3);
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = (store, type, id) => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             data: [{
//               type: 'comment',
//               id: '2'
//             }, {
//               type: 'comment',
//               id: '3'
//             }],
//             links: {
//               related: '/posts/1/comments'
//             }
//           }
//         }
//       },
//       included: [{
//         type: 'comment',
//         id: '2',
//         attributes: {
//           body: 'First comment'
//         }
//       }, {
//         type: 'comment',
//         id: '3',
//         attributes: {
//           body: 'Second comment'
//         }
//       }]
//     });
//
//     get(post, 'comments').then((comments) => {
//       assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
//
//
// test("asdasd", function(assert) {
//   assert.expect(3);
//
//   env.adapter.findHasMany = () => {
//     assert.ok(false, 'findHasMany should not be called');
//   };
//
//   env.adapter.findMany = () => {
//     assert.ok(false, 'findMany should not be called');
//   };
//
//   env.adapter.findRecord = (store, type, id) => {
//     assert.ok(false, 'findRecord should not be called');
//   };
//
//   run(function() {
//     let post = env.store.push({
//       data: {
//         type: 'post',
//         id: '1',
//         relationships: {
//           comments: {
//             links: {
//               related: '/posts/1/comments'
//             }
//           }
//         }
//       }
//     });
//
//     env.store.createRecord('comment', { id: 2, post });
//
//     get(post, 'comments').then((comments) => {
//       // assert.equal(get(comments, 'length'), 2, 'there are 2 comments');
//       // assert.equal(get(comments, 'firstObject.body'), 'First comment', 'first comment body is correct');
//       // assert.equal(get(comments, 'lastObject.body'), 'Second comment', 'second comment body is correct');
//     });
//   });
// });
