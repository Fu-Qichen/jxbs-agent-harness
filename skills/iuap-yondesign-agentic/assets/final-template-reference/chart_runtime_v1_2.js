/**
 * YonDesign V1.2 common chart runtime.
 * Stable, token-aware builders for enterprise report charts.
 */
(function (root) {
  'use strict';

  var VERSION = '1.2.3';
  var DEFAULT_COLORS = ['#4f8df7', '#26c6da', '#56b98f', '#f2c94c', '#f2994a', '#8b7cf6'];
  var LINE_TYPES = ['solid', 'dashed', 'dotted'];
  var SYMBOL_TYPES = ['circle', 'emptyCircle', 'diamond'];
  var TEXT_COLOR = '#475467';
  var AXIS_COLOR = '#667085';
  var LABEL_FONT_SIZE = 12;
  var LABEL_FONT_WEIGHT = 400;

  function token(name, fallback) {
    if (!root.document || typeof root.getComputedStyle !== 'function') return fallback;
    var value = root.getComputedStyle(root.document.documentElement).getPropertyValue(name);
    return value && value.trim() ? value.trim() : fallback;
  }

  function tokenColors() {
    return [
      token('--chart-series-1', DEFAULT_COLORS[0]),
      token('--chart-series-2', DEFAULT_COLORS[1]),
      token('--chart-series-3', DEFAULT_COLORS[2]),
      token('--chart-series-4', DEFAULT_COLORS[3]),
      token('--chart-series-5', DEFAULT_COLORS[4]),
      token('--chart-series-6', DEFAULT_COLORS[5])
    ];
  }

  function finiteNumber(value) {
    if (value == null || value === '' || (typeof value === 'string' && !value.trim())) return null;
    var number = Number(value);
    return Number.isFinite(number) ? number : null;
  }

  function designSpace(name, fallback) {
    var raw = token(name, fallback);
    var value = finiteNumber(raw);
    if (value != null) return value;
    var parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function chartSpacingTokens() {
    return {
      axisGap: designSpace('--space-2', 2),
      labelGap: designSpace('--space-4', 4)
    };
  }

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function containerHeight(config) {
    return Math.max(240, finiteNumber(config && config.containerHeight) || 360);
  }

  // Every chart reserves its own compact bands instead of relying on a fixed
  // card height. Axis labels, legend and external labels must never consume
  // the plotting area or leave an arbitrary blank band behind.
  function layoutBands(config, hasLegend, hasTopLabel) {
    var height = containerHeight(config);
    return {
      height: height,
      top: hasTopLabel ? clamp(Math.round(height * 0.095), 30, 38) : 16,
      bottom: hasLegend ? clamp(Math.round(height * 0.115), 42, 48) : 16,
      legend: hasLegend ? clamp(Math.round(height * 0.055), 18, 22) : 0
    };
  }

  function normalizeColors(colors) {
    return Array.isArray(colors) && colors.length ? colors.slice() : tokenColors();
  }

  var FIXED_CHART_TYPE_ALIASES = {
    verticalbar: true, column: true, bar: true, barchart: true, '柱状图': true, '竖柱': true,
    horizontalbar: true, hbar: true, barhorizontal: true, '条形图': true, '横条': true, '横向条形图': true,
    stackedbar: true, stackedcolumn: true, stackbar: true, '堆叠柱': true, '堆叠柱状图': true, '堆叠条': true, '堆叠条形图': true,
    line: true, linechart: true, '折线图': true, '折线': true,
    area: true, areachart: true, '面积图': true, '面积': true,
    donut: true, doughnut: true, ring: true, '环图': true, '环形图': true, '环': true,
    radar: true, radarchart: true, '雷达图': true, '雷达': true,
    scatter: true, scatterplot: true, '散点图': true, '散点': true,
    bubble: true, bubblechart: true, '气泡图': true, '气泡': true,
    combo: true, dualaxis: true, dualaxiscombo: true, barline: true, '双轴': true, '双轴组合': true, '柱线组合图': true,
    funnel: true, funnelchart: true, '漏斗图': true, '漏斗': true,
    gauge: true, gaugechart: true, '仪表盘': true, '仪表': true
  };

  function normalizeChartType(value) {
    return String(value == null ? '' : value).trim().toLowerCase().replace(/[\s_\-/]+/g, '');
  }

  function assertNativeChartType(chartType) {
    var original = String(chartType == null ? '' : chartType).trim();
    if (!original) {
      throw new Error('YonDesign V1.2 native ECharts requires an explicit non-fixed chartType');
    }
    if (FIXED_CHART_TYPE_ALIASES[normalizeChartType(original)]) {
      throw new Error('YonDesign V1.2 fixed chart type "' + original + '" must use its YonChartRuntimeV12 mount entry, not mountNative');
    }
  }

  function areaGradient(color) {
    var graphics = root.echarts && root.echarts.graphic;
    if (!graphics || typeof graphics.LinearGradient !== 'function') return color;
    return new graphics.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: color },
      { offset: 1, color: 'rgba(255,255,255,0)' }
    ]);
  }

  function labelTextStyle(color) {
    return { color: color || TEXT_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT };
  }

  function axisNameGraphics(leftName, rightName) {
    var graphics = [];
    if (leftName) graphics.push({ type: 'text', left: 0, top: 0, silent: true, style: Object.assign({ text: String(leftName), textAlign: 'left' }, labelTextStyle(AXIS_COLOR)) });
    if (rightName) graphics.push({ type: 'text', right: 0, top: 0, silent: true, style: Object.assign({ text: String(rightName), textAlign: 'right' }, labelTextStyle(AXIS_COLOR)) });
    return graphics;
  }

  function shadowAxisTooltip() {
    return { trigger: 'axis', confine: true, axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(79, 141, 247, 0.08)' } } };
  }

  function estimateCategoryLines(categories, narrow) {
    var limit = narrow ? 6 : 10;
    return categories.reduce(function (maximum, item) {
      var length = Array.from(String(item == null ? '' : item)).length;
      return Math.max(maximum, Math.ceil(length / limit));
    }, 1);
  }

  function createVerticalBarOption(config) {
    config = config || {};
    var categories = Array.isArray(config.categories) ? config.categories.map(String) : [];
    var colors = normalizeColors(config.colors);
    var seriesInput = Array.isArray(config.series) ? config.series : [];
    var multi = seriesInput.length > 1;
    var width = finiteNumber(config.containerWidth) || 960;
    var narrow = width <= 640;
    var legendPosition = 'bottom';
    var rotate = config.axisLabelRotate == null ? (narrow || categories.some(function (item) {
      return Array.from(item).length > 8;
    }) ? 30 : 0) : finiteNumber(config.axisLabelRotate);
    var labelLines = estimateCategoryLines(categories, narrow);
    var axisLabelHeight = rotate ? 38 : Math.min(48, labelLines * 16 + 8);
    var legendHeight = multi ? 20 : 0;
    var legendGap = multi ? 8 : 0;
    var bands = layoutBands(config, multi, Boolean(config.valueAxisName));
    var top = bands.top;
    var bottom = Math.max(axisLabelHeight + legendHeight + legendGap, bands.bottom);
    var barWidth = finiteNumber(config.barWidth) || (multi ? 14 : 20);

    var series = seriesInput.map(function (item, index) {
      var values = Array.isArray(item.data) ? item.data.map(finiteNumber) : [];
      return {
        name: item.name || ('系列' + (index + 1)),
        type: 'bar',
        barWidth: barWidth,
        barGap: '25%',
        barCategoryGap: multi ? '42%' : '56%',
        data: values,
        itemStyle: {
          color: colors[index % colors.length],
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: { focus: 'series' }
      };
    });

    var option = {
      animation: false,
      color: colors,
      tooltip: shadowAxisTooltip(),
      legend: multi ? {
        show: true,
        type: 'scroll',
        left: 'center',
        bottom: 4,
        orient: 'horizontal',
        itemWidth: 18,
        itemHeight: 8,
        itemGap: 20,
        data: series.map(function (item) { return item.name; }),
        textStyle: labelTextStyle()
      } : { show: false },
      grid: {
        left: narrow ? 48 : 56,
        right: 20,
        top: top,
        bottom: bottom,
        containLabel: false
      },
      xAxis: {
        type: 'category',
        data: categories,
        boundaryGap: true,
        axisTick: { alignWithLabel: true },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: {
          interval: 0,
          rotate: rotate || 0,
          hideOverlap: false,
          color: AXIS_COLOR, fontSize: LABEL_FONT_SIZE, fontWeight: LABEL_FONT_WEIGHT,
          lineHeight: 18,
          width: rotate ? null : (narrow ? 70 : 110),
          overflow: rotate ? 'truncate' : 'break'
        }
      },
      yAxis: {
        type: 'value',
        name: '',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: labelTextStyle(AXIS_COLOR),
        splitLine: { lineStyle: { color: '#eef1f5' } }
      },
      graphic: axisNameGraphics(config.valueAxisName || '', ''),
      series: series
    };
    Object.defineProperty(option, '__yonStability', {
      enumerable: false,
      value: {
        version: VERSION,
        type: 'vertical-bar',
        legendPosition: legendPosition,
        reserved: { axisLabel: axisLabelHeight, legend: legendHeight, gap: legendGap },
        containerWidth: width
      }
    });
    return option;
  }

  function normalizeHorizontalRows(rows) {
    return (Array.isArray(rows) ? rows : []).map(function (row, index) {
      row = row || {};
      return {
        name: String(row.name == null ? ('类别' + (index + 1)) : row.name),
        value: finiteNumber(row.value),
        countText: row.countText == null ? '' : String(row.countText),
        ratioText: row.ratioText == null ? '' : String(row.ratioText),
        color: row.color == null ? '' : String(row.color)
      };
    });
  }

  function createHorizontalBarOption(config) {
    config = config || {};
    var rows = normalizeHorizontalRows(config.rows);
    var visibleRows = Math.min(6, Math.max(1, rows.length || 1));
    var hasZoom = rows.length > visibleRows;
    var width = finiteNumber(config.containerWidth) || 960;
    var narrow = width <= 640;
    var spacing = chartSpacingTokens();
    var gridLeft = 12;
    return {
      animation: false,
      color: normalizeColors(config.colors),
      tooltip: {
        trigger: 'axis', confine: true, axisPointer: shadowAxisTooltip().axisPointer,
        formatter: function (items) {
          var data = items && items[0] && items[0].data && items[0].data.source;
          if (!data) return '';
          var detail = [data.countText, data.ratioText].filter(Boolean).join(' · ');
          return data.name + '<br>' + (config.valueName || '数值') + '：' + data.value + (config.unit || '') + (detail ? '<br>' + detail : '');
        }
      },
      grid: { left: gridLeft, right: hasZoom ? 34 : 20, top: layoutBands(config, false, false).top, bottom: layoutBands(config, false, false).bottom + 10, containLabel: true },
      xAxis: { type: 'value', name: '', axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { lineStyle: { color: '#eef1f5' } } },
      yAxis: { type: 'category', inverse: true, data: rows.map(function (row) { return row.name; }), axisLabel: { show: false }, axisLine: { show: false }, axisTick: { show: false } },
      dataZoom: hasZoom ? [
        { type: 'inside', yAxisIndex: 0, startValue: 0, endValue: visibleRows - 1, zoomLock: true, minValueSpan: visibleRows - 1, maxValueSpan: visibleRows - 1 },
        { type: 'slider', yAxisIndex: 0, right: 0, width: 8, startValue: 0, endValue: visibleRows - 1, zoomLock: true, minValueSpan: visibleRows - 1, maxValueSpan: visibleRows - 1 }
      ] : [],
      legend: { show: false, bottom: 0 },
      series: [{
        type: 'bar', barWidth: 12, barCategoryGap: '62%',
        itemStyle: { color: normalizeColors(config.colors)[0], borderRadius: [0, 4, 4, 0] },
        data: rows.map(function (row) { return { value: row.value, source: row, itemStyle: row.color ? { color: row.color } : undefined }; }),
        label: Object.assign({ show: false }, labelTextStyle())
      }]
    };
  }

  function estimateTextWidth(text, fontSize) {
    return Array.from(String(text || '')).reduce(function (sum, char) {
      return sum + (/^[\x00-\xff]$/.test(char) ? fontSize * 0.58 : fontSize);
    }, 0);
  }

  function calculateHorizontalBarLabels(chart, config) {
    var rows = normalizeHorizontalRows(config && config.rows);
    var option = chart.getOption();
    var zoom = option.dataZoom && option.dataZoom[0];
    var start = zoom && finiteNumber(zoom.startValue) != null ? finiteNumber(zoom.startValue) : 0;
    var end = zoom && finiteNumber(zoom.endValue) != null ? finiteNumber(zoom.endValue) : Math.min(rows.length - 1, 5);
    var grid = chart.getModel().getComponent('grid', 0).coordinateSystem.getRect();
    var fontSize = 12;
    var spacing = chartSpacingTokens();
    var gap = spacing.labelGap;
    var rightPadding = 8;
    var width = finiteNumber(chart.getWidth && chart.getWidth()) || 960;
    var narrow = width <= 640;
    var labels = [];
    rows.slice(start, end + 1).forEach(function (row, visibleIndex) {
      var categoryIndex = start + visibleIndex;
      var point = chart.convertToPixel({ seriesIndex: 0 }, [row.value, categoryIndex]);
      var zero = chart.convertToPixel({ seriesIndex: 0 }, [0, categoryIndex]);
      if (!point || !zero) return;
      var nameX = grid.x;
      var nameWidth = estimateTextWidth(row.name, fontSize);
      var detail = [row.countText, row.ratioText].filter(Boolean).join(' · ');
      var detailWidth = estimateTextWidth(detail, fontSize);
      var barRightX = Math.min(grid.x + grid.width - rightPadding, Math.max(point[0], zero[0]));
      var detailFitsBeforeBarEnd = barRightX - detailWidth >= nameX + nameWidth + gap;
      // A horizontal-bar label is always one line. For a short bar, anchor the
      // detail immediately after the dimension name instead of squeezing it
      // into the short bar's width or moving it into the next row.
      var detailX = detailFitsBeforeBarEnd ? barRightX : nameX + nameWidth + gap;
      var detailAlign = detailFitsBeforeBarEnd ? 'right' : 'left';
      var labelY = point[1] - (6 + spacing.labelGap);
      labels.push({
        name: row.name,
        detail: detail,
        nameY: labelY,
        detailY: labelY,
        nameX: nameX,
        detailX: detailX,
        detailAlign: detailAlign,
        detailWidth: detailWidth,
        stacked: false,
        barEndX: barRightX
      });
    });
    return labels;
  }

  function installHorizontalBarLabels(chart, config) {
    var latest = [];
    function refresh() {
      latest = calculateHorizontalBarLabels(chart, config || {});
      var graphics = [];
      latest.forEach(function (item, index) {
        graphics.push({ id: 'yon-hbar-name-' + index, type: 'text', silent: true, z: 20, x: item.nameX, y: item.nameY, style: { text: item.name, fill: TEXT_COLOR, font: LABEL_FONT_WEIGHT + ' ' + LABEL_FONT_SIZE + 'px sans-serif', align: 'left', verticalAlign: 'bottom' } });
        if (item.detail) graphics.push({ id: 'yon-hbar-detail-' + index, type: 'text', silent: true, z: 20, x: item.detailX, y: item.detailY, style: { text: item.detail, fill: TEXT_COLOR, font: LABEL_FONT_WEIGHT + ' ' + LABEL_FONT_SIZE + 'px sans-serif', align: item.detailAlign, verticalAlign: 'bottom' } });
      });
      var badge = sampleBadgeGraphic(config && config.__yonFallback);
      if (badge) graphics.push(badge);
      chart.setOption({ graphic: graphics }, { replaceMerge: ['graphic'] });
      return latest;
    }
    refresh();
    return { refresh: refresh, getLayout: function () { return latest; } };
  }

  function normalizeIndicators(indicators) {
    return (Array.isArray(indicators) ? indicators : []).map(function (item, index) {
      var source = typeof item === 'string' ? { name: item } : (item || {});
      return {
        name: source.name || ('维度' + (index + 1)),
        max: finiteNumber(source.max) || 100,
        min: finiteNumber(source.min) || 0
      };
    });
  }

  function createRadarOption(config) {
    config = config || {};
    var indicators = normalizeIndicators(config.indicators);
    var colors = normalizeColors(config.colors);
    var seriesInput = Array.isArray(config.series) ? config.series : [];
    var dimensionCount = indicators.length;
    var seriesCount = seriesInput.length;
    var narrow = (finiteNumber(config.containerWidth) || 960) <= 640;
    var recommendedHeight = seriesCount >= 3 || dimensionCount >= 7 ? 500 : 460;
    var height = containerHeight(config);
    var radius = narrow ? 62 : (dimensionCount >= 7 ? 64 : 70);
    // Leave a dedicated bottom band for the legend and expand only within the
    // measured container; this prevents both radar clipping and a tiny chart
    // floating in a tall card.
    if (finiteNumber(config.containerHeight) != null && height < 330) radius = Math.min(radius, narrow ? 58 : 64);
    if (height > 440) radius = Math.min(74, radius + 3);
    var centerY = narrow ? 49 : 48;
    var data = seriesInput.map(function (item, index) {
      return {
        name: item.name || ('系列' + (index + 1)),
        value: indicators.map(function (_, dimension) {
          return finiteNumber((item.values || item.value || [])[dimension]);
        }),
        symbol: SYMBOL_TYPES[index % SYMBOL_TYPES.length],
        symbolSize: 7,
        lineStyle: {
          color: colors[index % colors.length],
          width: 1.5,
          type: LINE_TYPES[index % LINE_TYPES.length]
        },
        itemStyle: { color: colors[index % colors.length] },
        areaStyle: { color: colors[index % colors.length], opacity: 0.045 },
        label: { show: false }
      };
    });

    var option = {
      animation: false,
      color: colors,
      tooltip: { trigger: 'item', confine: true },
      legend: seriesCount > 1 ? {
        show: true,
        type: 'scroll',
        bottom: 0,
        left: 'center',
        itemWidth: 18,
        itemHeight: 8,
        itemGap: 20,
        data: data.map(function (item) { return item.name; }),
        textStyle: labelTextStyle()
      } : { show: false },
      radar: {
        center: ['50%', centerY + '%'],
        radius: radius + '%',
        startAngle: 90,
        splitNumber: 4,
        shape: 'polygon',
        axisNameGap: narrow ? 24 : 30,
        indicator: indicators,
        axisName: labelTextStyle('#344054'),
        axisLine: { lineStyle: { color: '#d8dee8', width: 1 } },
        splitLine: { lineStyle: { color: '#d8dee8', width: 1 } },
        splitArea: {
          areaStyle: { color: ['rgba(248,250,252,0.92)', 'rgba(255,255,255,0.98)'] }
        }
      },
      series: [{ type: 'radar', z: 3, data: data }],
      graphic: []
    };
    Object.defineProperty(option, '__yonStability', {
      enumerable: false,
      value: {
        version: VERSION,
        type: 'radar',
        recommendedHeight: recommendedHeight,
        minimumHeight: recommendedHeight,
        radiusPercent: radius,
        centerYPercent: centerY,
        labelCount: seriesCount * dimensionCount
      }
    });
    return option;
  }

  function textRect(item, fontSize) {
    var width = Math.max(12, Array.from(String(item.value)).length * fontSize * 0.68 + 6);
    var height = fontSize + 6;
    return {
      left: item.x - width / 2,
      right: item.x + width / 2,
      top: item.y - height / 2,
      bottom: item.y + height / 2
    };
  }

  function overlaps(a, b) {
    return a.left < b.right + 2 && a.right > b.left - 2 && a.top < b.bottom + 2 && a.bottom > b.top - 2;
  }

  function calculateRadarPlacements(chart, config) {
    var option = chart.getOption();
    var radar = Array.isArray(option.radar) ? option.radar[0] : (option.radar || {});
    var series = Array.isArray(option.series) ? option.series[0] : (option.series || {});
    var data = series.data || [];
    var indicators = radar.indicator || [];
    var colors = normalizeColors(config && config.colors);
    var width = chart.getWidth();
    var height = chart.getHeight();
    var center = radar.center || ['50%', '50%'];
    var centerX = width * parseFloat(center[0]) / 100;
    var centerY = height * parseFloat(center[1]) / 100;
    var radiusPercent = parseFloat(radar.radius);
    var radius = Math.min(width, height) * radiusPercent / 200;
    var startAngle = (finiteNumber(radar.startAngle) || 90) * Math.PI / 180;
    var dimensionCount = indicators.length;
    var seriesCount = data.length;
    var fontSize = dimensionCount >= 7 ? 10 : 11;
    var placements = [];

    indicators.forEach(function (indicator, dimension) {
      var ranked = data.map(function (item, series) {
        return { series: series, value: finiteNumber(item.value[dimension]) };
      }).filter(function (item) { return item.value != null; })
        .sort(function (a, b) { return a.value - b.value || a.series - b.series; });
      var equalValues = ranked.length > 1 && ranked[0].value === ranked[ranked.length - 1].value;
      ranked.forEach(function (item, rank) {
        var angle = startAngle + dimension * Math.PI * 2 / dimensionCount;
        var radialX = Math.cos(angle);
        var radialY = -Math.sin(angle);
        var tangentX = -radialY;
        var tangentY = radialX;
        var maximum = finiteNumber(indicator.max) || 100;
        var minimum = finiteNumber(indicator.min) || 0;
        var ratio = Math.max(0, Math.min(1, (item.value - minimum) / Math.max(1, maximum - minimum)));
        var pointRadius = radius * ratio;
        var radialOffset = equalValues ? 0 : (rank === 0 ? -14 : (rank === ranked.length - 1 ? 14 : 0));
        var tangentStep = equalValues ? (seriesCount === 2 ? 16 : 13) : (seriesCount === 2 ? 10 : 9);
        var tangentOffset = (rank - (ranked.length - 1) / 2) * tangentStep;
        var labelRadius = Math.max(8, pointRadius + radialOffset);
        placements.push({
          series: item.series,
          dimension: dimension,
          value: item.value,
          angle: angle,
          radialX: radialX,
          radialY: radialY,
          tangentX: tangentX,
          tangentY: tangentY,
          pointRadius: pointRadius,
          labelRadius: labelRadius,
          baseTangentOffset: tangentOffset,
          tangentOffset: tangentOffset,
          x: centerX + radialX * labelRadius + tangentX * tangentOffset,
          y: centerY + radialY * labelRadius + tangentY * tangentOffset,
          color: colors[item.series % colors.length]
        });
      });
    });

    var rectangles = [];
    placements.forEach(function (item) {
      var selected = item.baseTangentOffset;
      var selectedRect = null;
      var candidates = [selected];
      for (var step = 1; step <= 12; step += 1) {
        candidates.push(selected + step * 6, selected - step * 6);
      }
      candidates.some(function (offset) {
        item.x = centerX + item.radialX * item.labelRadius + item.tangentX * offset;
        item.y = centerY + item.radialY * item.labelRadius + item.tangentY * offset;
        var rect = textRect(item, fontSize);
        if (!rectangles.some(function (other) { return overlaps(rect, other); })) {
          selected = offset;
          selectedRect = rect;
          return true;
        }
        return false;
      });
      item.tangentOffset = selected;
      item.collisionShifted = selected !== item.baseTangentOffset;
      rectangles.push(selectedRect || textRect(item, fontSize));
    });

    return { placements: placements, rectangles: rectangles, fontSize: fontSize };
  }

  function installRadarValueLabels(chart, config) {
    if (!chart || typeof chart.getOption !== 'function') {
      throw new Error('YonDesign V1.2 radar requires a valid ECharts instance');
    }
    var latest = null;
    var visibility = null;
    function selectedSeries() {
      var option = chart.getOption();
      var legend = Array.isArray(option.legend) ? option.legend[0] : option.legend;
      var series = Array.isArray(option.series) ? option.series[0] : option.series;
      var selected = legend && legend.selected;
      var radarData = series && series.data || [];
      return radarData.map(function (item) {
        return !selected || selected[item.name] !== false;
      });
    }
    function refresh(event) {
      latest = calculateRadarPlacements(chart, config || {});
      if (event && event.selected) visibility = event.selected;
      var option = chart.getOption();
      var series = Array.isArray(option.series) ? option.series[0] : option.series;
      var selected = visibility ? ((series && series.data) || []).map(function (item) { return visibility[item.name] !== false; }) : selectedSeries();
      chart.setOption({
        graphic: latest.placements.map(function (item) {
          return {
            id: 'yon-radar-value-' + item.series + '-' + item.dimension,
            type: 'text',
            silent: true,
            z: 20,
            invisible: !selected[item.series],
            x: item.x,
            y: item.y,
            style: {
              text: String(item.value),
              fill: item.color,
              font: LABEL_FONT_WEIGHT + ' ' + latest.fontSize + 'px sans-serif',
              align: 'center',
              verticalAlign: 'middle'
            }
          };
        }).concat(sampleBadgeGraphic(config && config.__yonFallback) || [])
      }, { replaceMerge: ['graphic'] });
      return latest;
    }
    refresh();
    chart.on('legendselectchanged', refresh);
    chart.on('legendselected', refresh);
    chart.on('legendunselected', refresh);
    return {
      refresh: refresh,
      getLayout: function () { return latest; },
      dispose: function () { chart.off('legendselectchanged', refresh); chart.off('legendselected', refresh); chart.off('legendunselected', refresh); }
    };
  }

  function bindStableResize(chart, afterResize, dom) {
    var timer = null;
    function handler() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        try {
          chart.resize();
          if (typeof afterResize === 'function') afterResize();
          else if (afterResize && typeof afterResize.refresh === 'function') afterResize.refresh();
        } catch (error) {
          warnFallback('resize', error && error.message ? error.message : 'resize failed');
        }
      }, 100);
    }
    if (root.addEventListener) root.addEventListener('resize', handler);
    var observer = null;
    if (dom && typeof root.ResizeObserver === 'function') {
      observer = new root.ResizeObserver(handler);
      observer.observe(dom);
    }
    return function () {
      clearTimeout(timer);
      if (root.removeEventListener) root.removeEventListener('resize', handler);
      if (observer) observer.disconnect();
    };
  }

  function resolveEcharts(echartsRuntime) {
    var runtime = echartsRuntime || root.echarts;
    if (!runtime || typeof runtime.init !== 'function') {
      throw new Error('YonDesign V1.2 chart runtime requires ECharts before initialization');
    }
    return runtime;
  }

  function showChartState(dom, message, isError) {
    if (!dom) return;
    if (!root.document || typeof root.document.createElement !== 'function' || typeof dom.appendChild !== 'function') return;
    dom.textContent = '';
    var state = root.document.createElement('div');
    state.className = 'empty';
    state.setAttribute('role', isError ? 'alert' : 'status');
    state.textContent = message;
    dom.appendChild(state);
  }

  function mountWhenSized(dom, initialize) {
    var mounted = null;
    var disposed = false;
    var observer = null;
    var timer = null;
    var attempts = 0;
    var maximumAttempts = 100;

    function hasSize() { return dom.clientWidth > 1 && dom.clientHeight > 1; }
    function stopWaiting() {
      clearTimeout(timer);
      timer = null;
      if (observer) observer.disconnect();
      observer = null;
      if (root.removeEventListener) root.removeEventListener('resize', tryMount);
    }
    function tryMount() {
      if (disposed || mounted) return;
      if (!hasSize()) {
        attempts += 1;
        showChartState(dom, attempts >= maximumAttempts ? '图表暂不可见，请展开卡片或切换到当前页签' : '图表加载中…', false);
        if (attempts < maximumAttempts) timer = setTimeout(tryMount, 100);
        return;
      }
      stopWaiting();
      dom.textContent = '';
      try {
        mounted = initialize();
      } catch (error) {
        showChartState(dom, '图表加载失败：' + (error && error.message ? error.message : '未知错误'), true);
        if (root.console && typeof root.console.error === 'function') root.console.error(error);
      }
    }

    showChartState(dom, '图表加载中…', false);
    if (typeof root.ResizeObserver === 'function') {
      observer = new root.ResizeObserver(tryMount);
      observer.observe(dom);
    }
    if (root.addEventListener) root.addEventListener('resize', tryMount);
    tryMount();

    var facade = {
      refresh: function () { if (mounted && mounted.refresh) mounted.refresh(); else tryMount(); },
      getOptionSpec: function () { return mounted && mounted.getOptionSpec ? mounted.getOptionSpec() : null; },
      getConfig: function () { return mounted && mounted.getConfig ? mounted.getConfig() : null; },
      getLabels: function () { return mounted && mounted.getLabels ? mounted.getLabels() : null; },
      dispose: function () {
        disposed = true;
        stopWaiting();
        if (mounted && mounted.dispose) mounted.dispose();
      }
    };
    Object.defineProperty(facade, 'chart', { enumerable: true, get: function () { return mounted ? mounted.chart : null; } });
    return facade;
  }

  function mountVerticalBar(dom, config, echartsRuntime) {
    if (!dom) throw new Error('YonDesign V1.2 vertical bar requires a chart container');
    return mountWhenSized(dom, function () {
      var runtime = resolveEcharts(echartsRuntime);
      var chart = runtime.init(dom, config && config.theme ? config.theme : null);
      var latestOption = null;
      var latestConfig = null;
      function render() {
        var nextConfig = Object.assign({}, config || {}, { containerWidth: dom.clientWidth, containerHeight: dom.clientHeight });
        var built = applyManagedOption(chart, 'vertical-bar', nextConfig, createVerticalBarOption);
        latestConfig = built.config;
        latestOption = built.option;
      }
      render();
      var unbind = bindStableResize(chart, render, dom);
      return { chart: chart, refresh: render, getOptionSpec: function () { return latestOption; }, getConfig: function () { return latestConfig; }, dispose: function () { unbind(); chart.dispose(); } };
    });
  }

  function mountRadar(dom, config, echartsRuntime) {
    if (!dom) throw new Error('YonDesign V1.2 radar requires a chart container');
    return mountWhenSized(dom, function () {
      var runtime = resolveEcharts(echartsRuntime);
      var chart = runtime.init(dom, config && config.theme ? config.theme : null);
      var labels = null;
      var latestOption = null;
      var latestConfig = null;
      function render() {
        if (labels && labels.dispose) labels.dispose();
        var nextConfig = Object.assign({}, config || {}, { containerWidth: dom.clientWidth, containerHeight: dom.clientHeight });
        var built = applyManagedOption(chart, 'radar', nextConfig, createRadarOption);
        latestConfig = built.config;
        latestOption = built.option;
        try {
          labels = installRadarValueLabels(chart, latestConfig);
        } catch (error) {
          warnFallback('radar labels', error && error.message ? error.message : 'label render failed');
          labels = null;
        }
      }
      render();
      var unbind = bindStableResize(chart, render, dom);
      return { chart: chart, refresh: render, getOptionSpec: function () { return latestOption; }, getConfig: function () { return latestConfig; }, getLabels: function () { return labels; }, dispose: function () { unbind(); if (labels && labels.dispose) labels.dispose(); chart.dispose(); } };
    });
  }

  function mountHorizontalBar(dom, config, echartsRuntime) {
    if (!dom) throw new Error('YonDesign V1.2 horizontal bar requires a chart container');
    return mountWhenSized(dom, function () {
      var runtime = resolveEcharts(echartsRuntime);
      var chart = runtime.init(dom, config && config.theme ? config.theme : null);
      var labels = null;
      var latestOption = null;
      var latestConfig = null;
      function render() {
        var nextConfig = Object.assign({}, config || {}, { containerWidth: dom.clientWidth, containerHeight: dom.clientHeight });
        var built = applyManagedOption(chart, 'horizontal-bar', nextConfig, createHorizontalBarOption);
        latestConfig = built.config;
        latestOption = built.option;
        try {
          labels = installHorizontalBarLabels(chart, latestConfig);
        } catch (error) {
          warnFallback('horizontal bar labels', error && error.message ? error.message : 'label render failed');
          labels = null;
        }
      }
      render();
      function refreshLabels() {
        if (!labels) return;
        try {
          labels.refresh();
        } catch (error) {
          warnFallback('horizontal bar labels', error && error.message ? error.message : 'label refresh failed');
        }
      }
      chart.on('datazoom', function () { setTimeout(refreshLabels, 0); });
      var unbind = bindStableResize(chart, render, dom);
      return { chart: chart, refresh: render, getOptionSpec: function () { return latestOption; }, getConfig: function () { return latestConfig; }, getLabels: function () { return labels; }, dispose: function () { unbind(); chart.dispose(); } };
    });
  }

  function requireArray(value, name) {
    if (!Array.isArray(value) || !value.length) throw new Error('YonDesign V1.2 requires non-empty ' + name);
    return value;
  }

  function numericData(values) {
    return (Array.isArray(values) ? values : []).map(function (value) {
      return value == null || value === '' ? null : finiteNumber(value);
    });
  }

  function legend(seriesCount) {
    return seriesCount > 1 ? { show: true, type: 'scroll', left: 'center', bottom: 4, itemWidth: 18, itemHeight: 8, itemGap: 20, textStyle: labelTextStyle() } : { show: false, bottom: 0 };
  }

  function cartesianBase(config, seriesCount) {
    var width = finiteNumber(config.containerWidth) || 960;
    var narrow = width <= 640;
    var bands = layoutBands(config, seriesCount > 1, Boolean(config.valueAxisName));
    return {
      animation: false,
      color: normalizeColors(config.colors),
      tooltip: shadowAxisTooltip(),
      legend: legend(seriesCount),
      grid: { left: narrow ? 16 : 20, right: narrow ? 16 : 20, top: bands.top, bottom: bands.bottom, containLabel: true },
      graphic: axisNameGraphics(config.valueAxisName || '', ''),
      xAxis: { type: 'category', data: requireArray(config.categories, 'categories').map(String), boundaryGap: true, axisLabel: Object.assign({ interval: 0, hideOverlap: false }, labelTextStyle(AXIS_COLOR)), axisLine: { lineStyle: { color: '#e5e7eb' } }, axisTick: { show: false } },
      yAxis: { type: 'value', name: '', axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { lineStyle: { color: '#eef1f5' } }, axisLine: { show: false }, axisTick: { show: false } }
    };
  }

  function createLineOption(config, area) {
    config = config || {};
    var input = requireArray(config.series, 'series');
    var colors = normalizeColors(config.colors);
    var option = cartesianBase(config, input.length);
    option.grid.left = narrowGridCompensation(config.containerWidth, 12, 16);
    option.grid.right = narrowGridCompensation(config.containerWidth, 12, 16);
    var bands = layoutBands(config, input.length > 1, Boolean(config.valueAxisName));
    option.grid.top = bands.top;
    option.grid.bottom = bands.bottom;
    option.xAxis.boundaryGap = true;
    option.series = input.map(function (item, index) {
      return { name: item.name || ('系列' + (index + 1)), type: 'line', smooth: config.smooth !== false, symbol: 'circle', symbolSize: 6, showSymbol: numericData(item.data).length <= 24, connectNulls: false, data: numericData(item.data), lineStyle: { width: 1.5, color: colors[index % colors.length] }, itemStyle: { color: colors[index % colors.length] }, areaStyle: area ? { color: areaGradient(colors[index % colors.length]), opacity: 0.12 } : undefined, emphasis: { focus: 'series' } };
    });
    return option;
  }

  function normalizeSlices(data) {
    return requireArray(data, 'data').map(function (item, index) {
      var source = typeof item === 'number' ? { name: '分类' + (index + 1), value: item } : (item || {});
      var value = finiteNumber(source.value);
      if (value == null || value < 0) throw new Error('YonDesign V1.2 pie data requires non-negative numeric values');
      return { name: String(source.name == null ? ('分类' + (index + 1)) : source.name), value: value };
    });
  }

  function narrowGridCompensation(containerWidth, narrowValue, wideValue) {
    return (finiteNumber(containerWidth) || 960) <= 640 ? narrowValue : wideValue;
  }

  function createDonutOption(config) {
    config = config || {};
    var data = normalizeSlices(config.data);
    var showLegend = data.length > 1;
    var width = finiteNumber(config.containerWidth) || 960;
    var narrow = width <= 640;
    var height = containerHeight(config);
    var radius = narrow ? ['43%', '58%'] : ['52%', '70%'];
    if (height < 330) radius = narrow ? ['40%', '54%'] : ['48%', '64%'];
    if (height > 420) radius = narrow ? ['45%', '62%'] : ['54%', '74%'];
    var centerY = showLegend ? (narrow ? '43%' : '44%') : '50%';
    var spacing = chartSpacingTokens();
    return { animation: false, color: normalizeColors(config.colors), tooltip: { trigger: 'item', confine: true, formatter: '{b}<br/>{c} ({d}%)' }, legend: showLegend ? { show: true, type: 'scroll', left: 'center', right: 12, bottom: 0, icon: 'circle', itemWidth: 10, itemHeight: 10, itemGap: 18, textStyle: labelTextStyle() } : { show: false }, series: [{ type: 'pie', radius: radius, center: ['50%', centerY], avoidLabelOverlap: true, minAngle: 2, data: data, itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 2 }, label: Object.assign({ show: data.length <= 8, formatter: function (params) { return params.name + '\n' + params.percent + '%'; }, alignTo: 'none', lineHeight: 16, edgeDistance: narrow ? 6 : 12, bleedMargin: 4, distanceToLabelLine: spacing.labelGap, width: narrow ? 88 : 116, overflow: 'break' }, labelTextStyle()), labelLine: { length: narrow ? 10 + spacing.labelGap : 14 + spacing.labelGap, length2: narrow ? 8 + spacing.axisGap : 12 + spacing.axisGap, maxSurfaceAngle: 80 }, labelLayout: { moveOverlap: 'shiftY', hideOverlap: false }, emphasis: { scaleSize: 6 } }] };
  }

  function normalizeScatterPoint(point) {
    var source = point;
    var name = '';
    if (Array.isArray(point)) {
      source = point;
      name = point[3];
    } else if (point && Array.isArray(point.value)) {
      source = point.value;
      name = point.name == null ? point.value[3] : point.name;
    } else {
      source = point || {};
      name = source.name;
    }
    if (Array.isArray(source)) {
      return [finiteNumber(source[0]), finiteNumber(source[1]), finiteNumber(source[2]), name];
    }
    return [finiteNumber(source.x), finiteNumber(source.y), finiteNumber(source.size), name];
  }

  function createScatterOption(config, bubble) {
    config = config || {};
    var input = requireArray(config.series, 'series');
    var colors = normalizeColors(config.colors);
    var values = [];
    input.forEach(function (series) { (series.data || []).forEach(function (point) { var normalized = normalizeScatterPoint(point); var size = normalized[2]; if (size != null) values.push(Math.max(0, size)); }); });
    var maxSize = Math.max.apply(Math, values.concat([1]));
    var width = finiteNumber(config.containerWidth) || 960;
    var narrow = width <= 640;
    var side = narrow ? 14 : 18;
    var bands = layoutBands(config, input.length > 1, Boolean(config.xAxisName || config.yAxisName));
    var option = { animation: false, color: colors, tooltip: { trigger: 'item', confine: true }, legend: legend(input.length), grid: { left: side, right: side, top: bands.top, bottom: bands.bottom, containLabel: true }, xAxis: { type: 'value', name: '', scale: true, boundaryGap: bubble ? ['8%', '8%'] : ['3%', '3%'], axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { lineStyle: { color: '#eef1f5' } } }, yAxis: { type: 'value', name: '', scale: true, boundaryGap: bubble ? ['8%', '12%'] : ['3%', '5%'], axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { lineStyle: { color: '#eef1f5' } } }, graphic: axisNameGraphics(config.yAxisName || '', config.xAxisName || '') };
    option.series = input.map(function (item, index) {
      var points = (item.data || []).map(normalizeScatterPoint).filter(function (point) { return point[0] != null && point[1] != null && (!bubble || point[2] != null); });
      var ranked = points.slice().sort(function (a, b) { return (b[2] || 0) - (a[2] || 0); }).slice(0, 5);
      return { name: item.name || ('系列' + (index + 1)), type: 'scatter', data: points, symbolSize: bubble ? function (point) { return 12 + Math.sqrt(Math.max(0, point[2]) / maxSize) * 36; } : 10, itemStyle: { color: colors[index % colors.length], opacity: bubble ? 0.7 : 0.82 }, label: Object.assign({ show: bubble, position: 'top', formatter: function (params) { return ranked.indexOf(params.value) >= 0 ? (params.value[3] || '') : ''; } }, labelTextStyle()), emphasis: { focus: 'series' } };
    });
    return option;
  }

  function createStackedBarOption(config) {
    var option = cartesianBase(config || {}, requireArray(config && config.series, 'series').length);
    var colors = normalizeColors(config.colors);
    option.series = config.series.map(function (item, index) { return { name: item.name || ('系列' + (index + 1)), type: 'bar', stack: config.stackName || 'total', barMaxWidth: 36, data: numericData(item.data), itemStyle: { color: colors[index % colors.length], borderRadius: index === config.series.length - 1 ? [3, 3, 0, 0] : 0 }, emphasis: { focus: 'series' } }; });
    return option;
  }

  function createComboOption(config) {
    config = config || {};
    var input = requireArray(config.series, 'series');
    var option = cartesianBase(config, input.length);
    var colors = normalizeColors(config.colors);
    option.grid.left = 18;
    option.grid.right = 18;
    var bands = layoutBands(config, input.length > 1, Boolean(config.leftAxisName || config.rightAxisName));
    option.grid.top = bands.top;
    option.grid.bottom = bands.bottom;
    option.yAxis = [{ type: 'value', name: '', axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { lineStyle: { color: '#eef1f5' } } }, { type: 'value', name: '', axisLabel: labelTextStyle(AXIS_COLOR), splitLine: { show: false } }];
    option.graphic = axisNameGraphics(config.leftAxisName || '', config.rightAxisName || '');
    option.series = input.map(function (item, index) { var line = item.type === 'line'; return { name: item.name || ('系列' + (index + 1)), type: line ? 'line' : 'bar', yAxisIndex: item.yAxisIndex === 1 ? 1 : 0, data: numericData(item.data), smooth: line, symbolSize: 6, barMaxWidth: 30, lineStyle: line ? { width: 2, color: colors[index % colors.length] } : undefined, itemStyle: { color: colors[index % colors.length], borderRadius: line ? 0 : [3, 3, 0, 0] } }; });
    return option;
  }

  function createFunnelOption(config) {
    config = config || {};
    var data = normalizeSlices(config.data).sort(function (a, b) { return b.value - a.value; });
    var bands = layoutBands(config, data.length > 1, false);
    return { animation: false, color: normalizeColors(config.colors), tooltip: { trigger: 'item', confine: true }, legend: { show: data.length > 1, type: 'scroll', left: 'center', bottom: 0, textStyle: labelTextStyle() }, series: [{ type: 'funnel', left: '12%', top: bands.top, bottom: bands.bottom, width: '76%', minSize: '20%', maxSize: '100%', sort: 'descending', gap: 3, data: data, label: Object.assign({ show: true, position: 'inside', formatter: '{b}  {c}' }, labelTextStyle('#fff')), itemStyle: { borderColor: '#fff', borderWidth: 1 } }] };
  }

  function createGaugeOption(config) {
    config = config || {};
    var value = finiteNumber(config.value); if (value == null) throw new Error('YonDesign V1.2 gauge requires numeric value');
    var min = finiteNumber(config.min); var max = finiteNumber(config.max); min = min == null ? 0 : min; max = max == null ? 100 : max; if (max <= min) throw new Error('YonDesign V1.2 gauge max must exceed min');
    var height = containerHeight(config);
    var radius = height < 320 ? '72%' : (height > 420 ? '82%' : '78%');
    return { animation: false, color: normalizeColors(config.colors), tooltip: { confine: true }, legend: { show: false }, series: [{ type: 'gauge', min: min, max: max, radius: radius, center: ['50%', '54%'], progress: { show: true, width: 14, roundCap: true }, axisLine: { lineStyle: { width: 14, color: [[1, '#eaecf0']] } }, axisTick: { show: false }, splitLine: { length: 8, lineStyle: { color: '#98a2b3' } }, axisLabel: Object.assign({ distance: 20 }, labelTextStyle(AXIS_COLOR)), pointer: { width: 5, length: '58%' }, title: Object.assign({ offsetCenter: [0, '72%'] }, labelTextStyle(AXIS_COLOR)), detail: { valueAnimation: false, formatter: '{value}' + (config.unit || ''), color: '#101828', fontSize: 24, fontWeight: 600, offsetCenter: [0, '38%'] }, data: [{ value: value, name: config.name || '' }] }] };
  }

  function configObject(config) {
    return config && typeof config === 'object' && !Array.isArray(config) ? config : {};
  }

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function axisData(axis) {
    if (Array.isArray(axis)) return axisData(axis[0]);
    return axis && Array.isArray(axis.data) ? axis.data : [];
  }

  function normalizeSeriesInput(series) {
    if (Array.isArray(series)) return series.filter(function (item) { return item && typeof item === 'object'; });
    if (series && typeof series === 'object') return [series];
    return [];
  }

  function seriesDataArray(item) {
    item = item || {};
    if (Array.isArray(item.data)) return item.data;
    if (Array.isArray(item.values)) return item.values;
    if (Array.isArray(item.value)) return item.value;
    return [];
  }

  function normalizeDataSeries(series) {
    return normalizeSeriesInput(series).map(function (item, index) {
      return Object.assign({}, item, {
        name: item.name || ('系列' + (index + 1)),
        data: seriesDataArray(item)
      });
    });
  }

  function hasFiniteValue(values) {
    return asArray(values).some(function (value) { return finiteNumber(value) != null; });
  }

  function hasFinitePoint(values, bubble) {
    return asArray(values).some(function (point) {
      var normalized = normalizeScatterPoint(point);
      return normalized[0] != null && normalized[1] != null && (!bubble || normalized[2] != null);
    });
  }

  function maxDataLength(series) {
    return normalizeSeriesInput(series).reduce(function (maximum, item) {
      return Math.max(maximum, seriesDataArray(item).length);
    }, 0);
  }

  function inferredCategories(length) {
    var count = Math.max(0, length || 0);
    var categories = [];
    for (var index = 0; index < count; index += 1) categories.push('项' + (index + 1));
    return categories;
  }

  function normalizeCategories(config, series) {
    return asArray(config.categories).length ? asArray(config.categories) :
      (axisData(config.xAxis).length ? axisData(config.xAxis) : inferredCategories(maxDataLength(series)));
  }

  function normalizeCartesianConfig(config) {
    config = configObject(config);
    var series = normalizeDataSeries(config.series);
    return Object.assign({}, config, {
      categories: normalizeCategories(config, series),
      series: series
    });
  }

  function normalizePieData(config) {
    config = configObject(config);
    var series = normalizeSeriesInput(config.series);
    var data = asArray(config.data).length ? config.data : (series[0] && Array.isArray(series[0].data) ? series[0].data : []);
    return Object.assign({}, config, { data: data });
  }

  function normalizeHorizontalBarConfig(config) {
    config = configObject(config);
    var rows = asArray(config.rows);
    if (rows.length) return Object.assign({}, config, { rows: rows });
    var series = normalizeDataSeries(config.series);
    var values = series[0] ? series[0].data : [];
    var categories = asArray(config.categories).length ? asArray(config.categories) :
      (axisData(config.yAxis).length ? axisData(config.yAxis) :
        (axisData(config.xAxis).length ? axisData(config.xAxis) : inferredCategories(values.length)));
    rows = categories.map(function (name, index) {
      return { name: name, value: values[index] };
    });
    return Object.assign({}, config, { rows: rows });
  }

  function normalizeRadarIndicators(config, series) {
    var indicators = asArray(config.indicators).length ? asArray(config.indicators) :
      (asArray(config.indicator).length ? asArray(config.indicator) :
        (config.radar && asArray(config.radar.indicator).length ? asArray(config.radar.indicator) :
          (Array.isArray(config.radar) && config.radar[0] && asArray(config.radar[0].indicator).length ? asArray(config.radar[0].indicator) : [])));
    if (indicators.length) return indicators;
    var count = normalizeSeriesInput(series).reduce(function (maximum, item) {
      return Math.max(maximum, seriesDataArray(item).length);
    }, 0);
    return inferredCategories(count).map(function (name) { return { name: name, max: 100 }; });
  }

  function normalizeRadarSeries(config) {
    var output = [];
    normalizeSeriesInput(config.series).forEach(function (item, index) {
      if (Array.isArray(item.data) && item.data.length && item.data[0] && typeof item.data[0] === 'object' && !Array.isArray(item.data[0])) {
        item.data.forEach(function (entry, entryIndex) {
          output.push({ name: entry.name || item.name || ('系列' + (index + entryIndex + 1)), values: seriesDataArray(entry) });
        });
        return;
      }
      output.push({ name: item.name || ('系列' + (index + 1)), values: seriesDataArray(item) });
    });
    return output;
  }

  function normalizeRadarConfig(config) {
    config = configObject(config);
    var series = normalizeRadarSeries(config);
    return Object.assign({}, config, {
      indicators: normalizeRadarIndicators(config, series),
      series: series
    });
  }

  function normalizeGaugeConfig(config) {
    config = configObject(config);
    return Object.assign({}, config);
  }

  function normalizeFixedConfig(type, config) {
    if (type === 'horizontal-bar') return normalizeHorizontalBarConfig(config);
    if (type === 'radar') return normalizeRadarConfig(config);
    if (type === 'donut' || type === 'funnel') return normalizePieData(config);
    if (type === 'gauge') return normalizeGaugeConfig(config);
    return normalizeCartesianConfig(config);
  }

  function validateFixedConfig(type, config) {
    config = configObject(config);
    if (type === 'horizontal-bar') {
      return normalizeHorizontalRows(config.rows).some(function (row) { return row.value != null; }) ? '' : '横向条形图缺少有效 rows';
    }
    if (type === 'radar') {
      if (!asArray(config.indicators).length) return '雷达图缺少 indicators';
      return normalizeSeriesInput(config.series).some(function (item) { return hasFiniteValue(item.values || item.value || item.data); }) ? '' : '雷达图缺少有效 series values';
    }
    if (type === 'donut' || type === 'funnel') {
      return asArray(config.data).some(function (item) {
        var source = typeof item === 'number' ? { value: item } : (item || {});
        var value = finiteNumber(source.value);
        return value != null && value >= 0;
      }) ? '' : type + ' 缺少有效 data';
    }
    if (type === 'scatter' || type === 'bubble') {
      return normalizeSeriesInput(config.series).some(function (item) { return hasFinitePoint(item.data, type === 'bubble'); }) ? '' : type + ' 缺少有效点位';
    }
    if (type === 'gauge') {
      var min = finiteNumber(config.min); var max = finiteNumber(config.max);
      min = min == null ? 0 : min; max = max == null ? 100 : max;
      return finiteNumber(config.value) != null && max > min ? '' : '仪表盘缺少有效 value 或 min/max';
    }
    if (!asArray(config.categories).length) return type + ' 缺少 categories';
    return normalizeSeriesInput(config.series).some(function (item) { return hasFiniteValue(item.data); }) ? '' : type + ' 缺少有效 series data';
  }

  function sampleConfigByType(type) {
    if (type === 'horizontal-bar') return { rows: [
      { name: '示例A', value: 86, countText: '样例', ratioText: '32%' },
      { name: '示例B', value: 72, countText: '样例', ratioText: '27%' },
      { name: '示例C', value: 58, countText: '样例', ratioText: '21%' },
      { name: '示例D', value: 44, countText: '样例', ratioText: '16%' }
    ] };
    if (type === 'radar') return {
      indicators: [{ name: '维度A', max: 100 }, { name: '维度B', max: 100 }, { name: '维度C', max: 100 }, { name: '维度D', max: 100 }, { name: '维度E', max: 100 }],
      series: [{ name: '示例', values: [82, 66, 90, 74, 88] }]
    };
    if (type === 'donut') return { data: [{ name: '示例A', value: 40 }, { name: '示例B', value: 32 }, { name: '示例C', value: 28 }] };
    if (type === 'funnel') return { data: [{ name: '阶段A', value: 100 }, { name: '阶段B', value: 76 }, { name: '阶段C', value: 54 }, { name: '阶段D', value: 38 }] };
    if (type === 'scatter') return { series: [{ name: '示例', data: [[12, 24, null, 'A'], [24, 32, null, 'B'], [36, 28, null, 'C'], [48, 44, null, 'D']] }] };
    if (type === 'bubble') return { series: [{ name: '示例', data: [[12, 24, 18, 'A'], [24, 32, 36, 'B'], [36, 28, 24, 'C'], [48, 44, 52, 'D']] }] };
    if (type === 'combo') return { categories: ['示例A', '示例B', '示例C', '示例D'], series: [{ name: '示例柱', type: 'bar', data: [42, 68, 55, 79] }, { name: '示例线', type: 'line', yAxisIndex: 1, data: [62, 74, 69, 82] }] };
    if (type === 'stacked-bar') return { categories: ['示例A', '示例B', '示例C'], series: [{ name: '系列1', data: [32, 42, 36] }, { name: '系列2', data: [24, 28, 31] }, { name: '系列3', data: [18, 22, 26] }] };
    if (type === 'line' || type === 'area') return { categories: ['示例A', '示例B', '示例C', '示例D', '示例E'], series: [{ name: '示例', data: [42, 58, 51, 66, 72] }] };
    if (type === 'gauge') return { name: '示例指标', value: 72, min: 0, max: 100, unit: '%' };
    return { categories: ['示例A', '示例B', '示例C', '示例D'], series: [{ name: '示例', data: [42, 68, 55, 79] }] };
  }

  function fallbackDisabled(config) {
    return config && (config.strict === true || config.fallback === false || config.fallback === 'error');
  }

  function carryRuntimeConfig(target, source) {
    source = configObject(source);
    target = Object.assign({}, target);
    ['theme', 'colors', 'containerWidth', 'containerHeight', 'smooth', 'unit', 'valueName', 'valueAxisName', 'leftAxisName', 'rightAxisName', 'xAxisName', 'yAxisName'].forEach(function (key) {
      if (source[key] != null) target[key] = source[key];
    });
    return target;
  }

  function warnFallback(type, reason) {
    if (root.console && typeof root.console.warn === 'function') {
      root.console.warn('YonDesign V1.2 chart fallback:', type, reason);
    }
  }

  function fallbackConfig(type, source, reason) {
    var sample = carryRuntimeConfig(sampleConfigByType(type), source);
    sample.__yonFallback = reason || '数据缺失或格式不匹配';
    return sample;
  }

  function prepareManagedConfig(type, config) {
    var normalized = normalizeFixedConfig(type, config);
    var reason = validateFixedConfig(type, normalized);
    if (!reason) return normalized;
    if (fallbackDisabled(config)) return normalized;
    warnFallback(type, reason);
    return fallbackConfig(type, config, reason);
  }

  function sampleBadgeGraphic(reason) {
    if (!reason) return null;
    return {
      id: 'yon-sample-badge',
      type: 'text',
      right: 8,
      top: 8,
      silent: true,
      z: 100,
      style: {
        text: '示例数据 · ' + String(reason).replace(/^.*?缺少/, '缺少').slice(0, 18),
        fill: '#667085',
        font: '400 12px sans-serif',
        backgroundColor: 'rgba(255,255,255,0.82)',
        padding: [3, 6],
        borderRadius: 3
      }
    };
  }

  function decorateSampleOption(option, config) {
    var badge = sampleBadgeGraphic(config && config.__yonFallback);
    if (!badge || !option || typeof option !== 'object') return option;
    var graphics = Array.isArray(option.graphic) ? option.graphic.slice() : (option.graphic ? [option.graphic] : []);
    graphics.push(badge);
    option.graphic = graphics;
    Object.defineProperty(option, '__yonFallback', {
      enumerable: false,
      value: { reason: config.__yonFallback, sample: true }
    });
    return option;
  }

  function buildManagedOption(type, config, builder) {
    var prepared = prepareManagedConfig(type, config);
    try {
      return { config: prepared, option: decorateSampleOption(builder(prepared), prepared) };
    } catch (error) {
      if (fallbackDisabled(config)) throw error;
      var reason = error && error.message ? error.message : '配置无法渲染';
      warnFallback(type, reason);
      prepared = fallbackConfig(type, config, reason);
      return { config: prepared, option: decorateSampleOption(builder(prepared), prepared) };
    }
  }

  function applyManagedOption(chart, type, config, builder) {
    var built = buildManagedOption(type, config, builder);
    try {
      chart.setOption(built.option, true);
      return built;
    } catch (error) {
      // A failed sample option cannot be recovered by retrying the same path.
      if (fallbackDisabled(config) || (built.config && built.config.__yonFallback)) throw error;
      var reason = error && error.message ? error.message : 'ECharts option render failed';
      warnFallback(type, reason);
      built = buildManagedOption(type, fallbackConfig(type, config, reason), builder);
      chart.setOption(built.option, true);
      return built;
    }
  }

  function mountOption(dom, config, builder, type, echartsRuntime) {
    if (!dom) throw new Error('YonDesign V1.2 ' + type + ' requires a chart container');
    return mountWhenSized(dom, function () {
      var runtime = resolveEcharts(echartsRuntime);
      var chart = runtime.init(dom, config && config.theme ? config.theme : null); var latest;
      var latestConfig = null;
      function render() {
        var built = applyManagedOption(chart, type, Object.assign({}, config || {}, { containerWidth: dom.clientWidth, containerHeight: dom.clientHeight }), builder);
        latestConfig = built.config;
        latest = built.option;
      }
      render(); var unbind = bindStableResize(chart, render, dom);
      return { chart: chart, refresh: render, getOptionSpec: function () { return latest; }, getConfig: function () { return latestConfig; }, dispose: function () { unbind(); chart.dispose(); } };
    });
  }

  function mountNative(dom, config, echartsRuntime) {
    if (!dom) throw new Error('YonDesign V1.2 native ECharts requires a chart container');
    config = config || {};
    return mountWhenSized(dom, function () {
      var runtime = resolveEcharts(echartsRuntime);
      var chart = runtime.init(dom, config.theme ? config.theme : null);
      var latest = null;
      function nativeProblem() {
        try {
          assertNativeChartType(config.chartType);
        } catch (error) {
          return error && error.message ? error.message : 'native chartType invalid';
        }
        if (!config.option || typeof config.option !== 'object' || Array.isArray(config.option)) {
          return 'YonDesign V1.2 native ECharts requires an option object';
        }
        return '';
      }
      function render() {
        var problem = nativeProblem();
        if (problem) {
          if (fallbackDisabled(config)) throw new Error(problem);
          warnFallback('native', problem);
          var built = buildManagedOption('vertical-bar', fallbackConfig('vertical-bar', config, problem), createVerticalBarOption);
          latest = built.option;
          chart.setOption(latest, true);
          return;
        }
        try {
          latest = config.option;
          chart.setOption(latest, true);
        } catch (error) {
          if (fallbackDisabled(config)) throw error;
          var reason = error && error.message ? error.message : 'native option render failed';
          warnFallback('native', reason);
          var fallback = buildManagedOption('vertical-bar', fallbackConfig('vertical-bar', config, reason), createVerticalBarOption);
          latest = fallback.option;
          chart.setOption(latest, true);
        }
      }
      render();
      var unbind = bindStableResize(chart, null, dom);
      return { chart: chart, refresh: render, getOptionSpec: function () { return latest; }, dispose: function () { unbind(); chart.dispose(); } };
    });
  }

  root.YonChartRuntimeV12 = {
    version: VERSION,
    colors: DEFAULT_COLORS.slice(),
    createVerticalBarOption: createVerticalBarOption,
    createHorizontalBarOption: createHorizontalBarOption,
    createRadarOption: createRadarOption,
    createStackedBarOption: createStackedBarOption,
    createLineOption: function (config) { return createLineOption(config, false); },
    createAreaOption: function (config) { return createLineOption(config, true); },
    createDonutOption: createDonutOption,
    createScatterOption: function (config) { return createScatterOption(config, false); },
    createBubbleOption: function (config) { return createScatterOption(config, true); },
    createComboOption: createComboOption,
    createFunnelOption: createFunnelOption,
    createGaugeOption: createGaugeOption,
    calculateHorizontalBarLabels: calculateHorizontalBarLabels,
    installHorizontalBarLabels: installHorizontalBarLabels,
    calculateRadarPlacements: calculateRadarPlacements,
    installRadarValueLabels: installRadarValueLabels,
    bindStableResize: bindStableResize,
    mountVerticalBar: mountVerticalBar,
    mountHorizontalBar: mountHorizontalBar,
    mountRadar: mountRadar,
    mountStackedBar: function (dom, config, echartsRuntime) { return mountOption(dom, config, createStackedBarOption, 'stacked-bar', echartsRuntime); },
    mountLine: function (dom, config, echartsRuntime) { return mountOption(dom, config, function (value) { return createLineOption(value, false); }, 'line', echartsRuntime); },
    mountArea: function (dom, config, echartsRuntime) { return mountOption(dom, config, function (value) { return createLineOption(value, true); }, 'area', echartsRuntime); },
    mountDonut: function (dom, config, echartsRuntime) { return mountOption(dom, config, createDonutOption, 'donut', echartsRuntime); },
    mountScatter: function (dom, config, echartsRuntime) { return mountOption(dom, config, function (value) { return createScatterOption(value, false); }, 'scatter', echartsRuntime); },
    mountBubble: function (dom, config, echartsRuntime) { return mountOption(dom, config, function (value) { return createScatterOption(value, true); }, 'bubble', echartsRuntime); },
    mountCombo: function (dom, config, echartsRuntime) { return mountOption(dom, config, createComboOption, 'combo', echartsRuntime); },
    mountFunnel: function (dom, config, echartsRuntime) { return mountOption(dom, config, createFunnelOption, 'funnel', echartsRuntime); },
    mountGauge: function (dom, config, echartsRuntime) { return mountOption(dom, config, createGaugeOption, 'gauge', echartsRuntime); },
    mountNative: mountNative
  };
})(typeof window !== 'undefined' ? window : globalThis);
