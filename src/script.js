import * as JSC from 'jscharting'
// JSC.defaults({ baseUrl: './js/jsc/dist' });
// export default JSC;

var chart, data, selectedCountry; 

JSC.fetch('/maps/worldcities.csv') 
  .then(function(response) { return response.text(); }) 
  .then(function(text) { data = JSC.csv2Json(text); chart = renderChart(); }) 
  .catch(function(error) { console.error(error); }); 
  
function renderChart() { 
    return JSC.chart('chartDiv', { 
      // debug: true, 
      type: 'map solid', 
      legend_visible: false, 
      mapping_projection: false,
      annotations: [ 
        { 
          position: 'top left', 
          label: { 
            text: 'Click country to load cities', 
            style_fontSize: '20px'
          } 
        } 
      ], 
      events_pointSelectionChanged: selectionChanged, 
      defaultSeries: { pointSelection: true }, 
      defaultSeries_color: '#A0DFF8', 
      defaultAnnotation: { asHTML: true, margin: 0 }, 
      annotations: [ 
        { 
          label_text: '', 
          position: 'center'
        } 
      ], 
      series: [ 
        { map: 'americas' }, 
        { map: 'europe' }, 
        { map: 'asia' }, 
        { map: 'oceania' }, 
        { map: 'africa' } 
      ], 
      toolbar_items: { 
        resetZoom_visible: false, 
        export_visible: false, 
        Clear: { 
          type: 'option', 
          visible: false, 
          margin: 5, 
          label_text: 'Reset Zoom', 
          boxVisible: true, 
          events_click: clearSelection 
        } 
      },
      chartArea: {
        fill: { image: '/foto.jpg' },
        opacity: 0.1
      },
      
    }); 
}   

  function selectionChanged(items) { 
    if (items.length !== 0) { 
      var point = items[0]; 
      var c = point.chart; 
      var countryCode = point.tokenValue('%countrycode'); 
      var countryName = point.tokenValue('%name'); 
      var seriesId = countryName + 'cities'; 
    
      selectedCountry = countryName; 
    
      // Filter data by countrycode
      var countryData = data.filter(function(v) { return v.iso2 === countryCode; }); 
    
      // show first 100 cities with a population above average if the number of cities is more than 1000 
      if (countryData.length >= 100) { 
        var averagePopulation = JSC.mean(data, 'population'); 
        countryData = countryData.filter(function(v) { return v.population >= averagePopulation; }).slice(0, 100); 
      } 
     
      var citiesSeries = { 
        palette: {
          pointValue: function(point) { return point.options('z'); },
          // colors: ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0',
          //   '#225ea8', '#253494', '#081d58'
          // ],
          // colors: ['#d1eeea', '#a8dbd9', '#85c4c9', '#68abb8', '#4f90a6', '#3b738f', '#2a5674']
          // colors: ['#b0f2bc', '#89e8ac', '#67dba5', '#4cc8a3', '#38b2a3', '#2c98a0', '#257d98']
          colors: ['#f3e0f7','#e4c7f1','#d1afe8','#b998dd','#9f82ce','#826dba','#63589f'],
          // colorBar: { width: 30, axis_formatString: 'c0' }
        },
        type: 'bubble', 
        id: seriesId, 
        pointSelection: false, 
        size: [30, 120], // Tamaño Burbujas 
        // defaultPoint: {
        //   fill: ["currentColor", "white", 90]
        // },
        points: countryData.map(function(item) { 
          var isCapital = item.capital === 'primary'; 
          return { 
            name: item.city, 
            x: item.lng, 
            y: item.lat, 
            z: item.population, 
            events_click: function() { return false; }, 
            cursor: 'default', 
            // opacity: isCapital ? 1 : 0.5, 
            // color: isCapital ? '#1565C0' : null, 
            shape_fill: isCapital ? ["currentColor", "white", 90] : null,
            tooltip: isCapital ? '%name (Capital)<br>Population: <b>%zValue</b>' : '%name<br>Population: <b>%zValue</b>' 
          }; 
        }) 
      }; 
      c.uiItems('Clear').options({ visible: true }); 
      c.series.splice( 
        5, 
        c.series(5) ? 1 : 0, 
        [citiesSeries], 
        { 
          then: function() { this.series(seriesId).zoomTo(); } // Zoom to the cities map 
        } 
      ); 
    } else { 
      clearSelection(); 
    } 
  } 
    
function clearSelection() { 
    if(chart.series(5)) chart.series(5).remove()
    chart.zoom(1, { animation: false }); 
    chart 
      .series() 
      .points() 
      .options({ selected: false }); 
    chart 
      .uiItems('Clear') 
      .options({ visible: false }); 
  } 
