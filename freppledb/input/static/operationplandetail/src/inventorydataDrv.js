/*
 * Copyright (C) 2024 by frePPLe bv
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
 *
 */

'use strict';

angular.module('operationplandetailapp').directive('showinventorydataDrv', showinventorydataDrv);

showinventorydataDrv.$inject = ['$window', '$filter', 'gettextCatalog'];

function showinventorydataDrv($window, $filter, gettextCatalog) {

  var directive = {
    restrict: 'EA',
    scope: { operationplan: '=data' },
    link: linkfunc
  };
  return directive;

  function linkfunc(scope, elem, attrs) {
    scope.$watchGroup(['operationplan.id', 'operationplan.inventoryreport.length'], function (newValue, oldValue) {
      angular.element(document).find('#attributes-inventorydata').empty().append(
        '<div class="card-header d-flex align-items-center" data-bs-toggle="collapse" data-bs-target="#widget_inventorydata" aria-expanded="false" aria-controls="widget_inventorydata">' +
        '<h5 class="card-title text-capitalize fs-5 me-auto">' +
        gettextCatalog.getString("inventory") +
        '</h5><span class="fa fa-arrows align-middle w-auto widget-handle"></span></div>' +
        '<div class="card-body collapse' +
        (scope.$parent.widget[1]["collapsed"] ? '' : ' show') +
        '" id="widget_inventorydata"><div class="table-responsive">' +
        '<table class="table table-sm table-hover table-borderless">' + '<colgroup/>' +
        '<thead class="text-nowrap"></thead><tbody></tbody></table>' +
        '</div></div>'
      );
      var rows = ['<tr><td colspan="1">' + gettextCatalog.getString('no inventory information') + '</td></tr>'];
      var columnHeaders = ['<tr></tr>'];
      var columnGroups = ['<col>'];

      if (typeof scope.operationplan !== 'undefined') {
        if (scope.operationplan.hasOwnProperty('inventoryreport')) {
          columnHeaders = ['<tr class="text-center"><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"></td>'];
          columnGroups = ['<col>'];
          rows = [
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="text-capitalize text-nowrap">' + gettextCatalog.getString("start inventory") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="text-capitalize text-nowrap">' + gettextCatalog.getString("safety stock") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="text-capitalize text-nowrap">' + gettextCatalog.getString("total consumed") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="px-3 text-capitalize text-nowrap">' + gettextCatalog.getString("consumed proposed") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="px-3 text-capitalize text-nowrap">' + gettextCatalog.getString("consumed confirmed") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="text-capitalize text-nowrap">' + gettextCatalog.getString("total produced") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="px-3 text-capitalize text-nowrap">' + gettextCatalog.getString("produced proposed") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="px-3 text-capitalize text-nowrap">' + gettextCatalog.getString("produced confirmed") + '</span></td>',
            '<tr><td style="position: sticky; left: 0px; background:var(--bs-card-bg)"><span class="text-capitalize text-nowrap">' + gettextCatalog.getString("end inventory") + '</span></td>',
          ];
          angular.forEach(scope.operationplan.inventoryreport, function (inventoryData, colIndex) {
            columnHeaders.push('<td id="inventorydata"' + inventoryData[0].replace(" ", "") +
              '" style="background: var(--bs-card-bg);" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip"' +
              'data-bs-title="' + $filter('formatdate')(inventoryData[1]) + ' - ' + $filter('formatdate')(inventoryData[2]) + '">' +
              (inventoryData[3] ? '<i class="text-capitalize">' : '<b class="text-capitalize">')
              + inventoryData[0] + (inventoryData[3] ? '</i></td>' : '</b></td>')
            );
            let gradient_idx = null;
            let isRed = false;
            let gradientBackground = false;
            let cellValue = 0;
            for (const i in inventoryData.slice(4)) {
              cellValue = $filter('number')(inventoryData.slice(4)[i]);
              if (i == 0) {
                isRed = inventoryData.slice(4)[0] < inventoryData.slice(4)[1] || inventoryData.slice(4)[0] < 0;
              } else if (i > 0) {
                isRed = false;
              };
              if (!(i == 0 || i == 8) && cellValue == 0) {
                cellValue = "";
              }
              rows[i] += '<td class="text-center" style="' + (isRed?'color: red; font-weight: bold;">':'">') + cellValue + '</td>';
            }

            if (isRed) {
              gradient_idx = 0;
              gradientBackground = true;
            } else if (inventoryData[4] >= inventoryData[5] || inventoryData[5] === 0) {
              gradientBackground = false;
            } else {
              gradient_idx = Math.round(inventoryData[4] / inventoryData[5] * 165);
              gradientBackground = true;
            };

            columnGroups.push('<col id="col' + colIndex + '" style="' + (gradientBackground ? 'background: linear-gradient(white 0%, rgba(255,'+gradient_idx+',0,0.2) 40%, rgba(255,'+gradient_idx+',0,0.2) 60%, white 100%);"':'background: var(--bs-card-bg);"') + '>');
          });
          columnHeaders.push('</tr>');
          rows = rows.map(x => x + '</tr>');
        }
      }

      angular.element(document).find('#attributes-inventorydata thead').append(columnHeaders.join(""));
      angular.element(document).find('#attributes-inventorydata tbody').append(rows.join(""));
      angular.element(document).find('#attributes-inventorydata colgroup').append(columnGroups.join(""));

      angular.element(elem).find('.collapse')
        .on("shown.bs.collapse", grid.saveColumnConfiguration)
        .on("hidden.bs.collapse", grid.saveColumnConfiguration);

      let widgetTooltipTriggerList = document.querySelectorAll('#attributes-inventorydata [data-bs-toggle="tooltip"]');

      let widgetTooltipList = [...widgetTooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, { container: 'body', offset: '[0,5]' }));
    }); //watch end

  } //link end
} //directive end
