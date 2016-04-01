# angular-drag-columns

AngularJS module for draggable table columns. 

## How to install

```
bower install angular-drag-columns --save
```

```
<link rel="stylesheet" href="bower_components/angular-drag-columns/src/angular-drag-columns.css">
<script src="bower_components/angular-drag-columns/src/angular-drag-columns.js"></script>
```

Add `dragcolumns` module.
```
angular.module('app', [
    // ...
    'dragcolumns'
]);
```

## Compatibility

- Descop & Mobile Browsers

## Components

### dragcolumns 

Directive

Assign it to the table element, to enable columns dragging

```
<table dragcolumns="columnsOrder"></table>
```

You can pass columns order to it. It should be an array. It will be reordered, than columns will be dragging.

### dragcolumns-item

Directive

Assign it to the header of columns, to enable specific column dragging.

If you pass `columnsOrder` object to the dragcolumns directive, pass item of specific column to the dragcolumns-item. It's used to reorder columnsOrder array, when columns were dragged.

#### dragcolumns-item-key

Directive

It is required option. Key must be unique for dragcolumn-item. It'is used as hash inside module.

## Example

See example in `example` folder

## TODO

- multitouch
- auto scroll if draggin is around edge and scroll is available