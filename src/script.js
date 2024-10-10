import * as JSC from 'jscharting'
JSC.defaults({ baseUrl: './js/jsc/dist' });
export default JSC;

var chart, data, selectedCountry; 
var palette = ['#b4ddba', '#42A5F5', '#1565C0']; 

JSC.fetch('/maps/worldcities.csv') 
  .then(function(response) { return response.text(); }) 
  .then(function(text) { data = JSC.csv2Json(text); chart = renderChart(); }) 
  .catch(function(error) { console.error(error); }); 
  
function renderChart() { 
    return JSC.chart('chartDiv', { 
      debug: true, 
      type: 'map solid', 
      legend_visible: false, 
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
      defaultPoint_color: palette[0], 
      defaultAnnotation: { asHTML: true, margin: 2 }, 
      annotations: [ 
        { 
          label_text: '', 
          position: 'left'
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
        fill: { image: '/tacos.jpg' },
        opacity: 0.1
      },
      // palette: {
      //   pointValue: function(point) {
      //     console.log(point.options('z'))
      //     return point.options('z');
      //   },
      //   colors: ['#ffffe5', '#fff7bc', '#fee391', '#fec44f', '#ec7014', '#cc4c02', '#993404', '#662506'],
      //   colorBar: { width: 16, axis_formatString: 'c0' }
      // }
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
        type: 'bubble', 
        id: seriesId, 
        pointSelection: false, 
        size: [5, 100], // Tamaño Burbujas 
        defaultPoint: { opacity: 0.2, outline: { width: 1, color: 'lighten' } }, 
        points: countryData.map(function(item) { 
          var isCapital = item.capital === 'primary'; 
          return { 
            name: item.city, 
            x: item.lng, 
            y: item.lat, 
            z: item.population, 
            events_click: function() { return false; }, 
            cursor: 'default', 
            opacity: isCapital ? 1 : 0.8, 
            color: isCapital ? palette[2] : palette[1], 
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


  function makeSeries(map, data) {
    var series = [
      {
        points: data.map(function(item) {
          return {
            map,
            rango: parseFloat(item.personal_income_2020)
          };
        })
      }
    ];
    return series;
  }



