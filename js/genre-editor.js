"use strict";

YUI.add('gemviz-genre-editor', function (Y) {
  var GenreEditor = Y.Base.create('genreEditor', Y.Overlay, [], {
    initializer: function (config) {
      var nameInput = this.get('nameInput');
      this.after('genreChange', this.syncUI, this);
      nameInput.on('keyup', this.syncGenre, this);
      nameInput.on('valueChange', this.syncGenre, this);
      this.get('closeButton').on('click', this.hide, this);
    },
    syncUI: function () {
      var genre = this.get('genre'),
          name = genre && genre.get('name') || '';
      this.set('align', {
        node: genre.get('g'),
        points: [Y.WidgetPositionAlign.TL, Y.WidgetPositionAlign.BR]
      }),
      this.get('nameInput').set('value', name);
    },
    syncGenre: function () {
      var genre = this.get('genre');
      if (genre) {
        genre.set('name', this.get('nameInput').get('value'));
      }
    },
    edit: function (genre, where) {
      this.set('genre', genre);
      if (where)
        this.set('xy', where);
      this.render();
      this.show();
    }
  }, {
    ATTRS: {
      closeButton: {},
      genre: {},
      nameInput: {}
    },
    HTML_PARSER: {
      closeButton: '.editor-close',
      nameInput: 'input[name=name]'
    },
    edit: function () {
      var args = Array.prototype.slice.call(arguments, 0);
      if (GenreEditor.instance) {
        return GenreEditor.instance.edit.apply(GenreEditor.instance, args);
      } else {
        Y.on('contentready', function (evt) {
          GenreEditor.instance = new GenreEditor({
            boundingBox: this,
            contentBox: this,
            render: false,
            visible: false
          });
          GenreEditor.edit.apply(GenreEditor, args);
        }, '.yui3-genreeditor');
      }
    }
  });

  Y.GenreEditor = GenreEditor;
}, '0.1', { requires: ['overlay'] });
