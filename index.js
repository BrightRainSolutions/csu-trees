import EsriConfig from "https://js.arcgis.com/4.30/@arcgis/core/config.js";
import FeatureLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/FeatureLayer.js";
import GraphicsLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/GraphicsLayer.js";
import VectorTileLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/VectorTileLayer.js";
import TileLayer from "https://js.arcgis.com/4.30/@arcgis/core/layers/TileLayer.js";
import Map from "https://js.arcgis.com/4.30/@arcgis/core/Map.js";
import MapView from "https://js.arcgis.com/4.30/@arcgis/core/views/MapView.js";
import Basemap from "https://js.arcgis.com/4.30/@arcgis/core/Basemap.js";
import BasemapToggle from "https://js.arcgis.com/4.30/@arcgis/core/widgets/BasemapToggle.js";

// import core Vue createApp and the markRaw utility we need to use with esri geometry objects (because they are so big and funky)
// dev
//import { createApp, markRaw } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";
// prod
import { createApp, markRaw } from "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js";

import config from "./config.js";

// custom components
import CollapsiblePanel from './components/CollapsiblePanel.js';

// Note that the widgets and other arc things will not work if we make them reactive data
// setting a global object, so sue me
// We don't want them to be reactive anyway
import { rogueState } from './rogueState.js';

createApp({
  template: `
    <div id="csu-trees-header">
      <div class="color-blocks">
        <div class="block csu-flower-trial-red-bg"></div>
        <div class="block csu-energy-green-bg"></div>
        <div class="block csu-white-bg"></div>
        <div class="block csu-aggie-orange-bg"></div>
        <div class="block csu-powdered-purple-bg"></div>
      </div>
      <div class="header-content">
        <span id="more-info" class="is-size-6" @click="showingInformationModal=true">MORE INFO</span>
        <div class="logo ml-4">
          <figure class="image">
            <img src="./assets/csu-logo.svg" alt="Colorado State University Logo" />
          </figure>
        </div>
        <div class="title">
          <h1 class="title is-3 has-text-white">CSU TREES</h1>
          <h2 class="subtitle is-4 has-text-white">Colorado State University</h2>
        </div>
      </div>
    </div>  

    <div
      id="notification"
      v-show="isNotifying"
      class="notification"
      :class="{
        'is-success': notification.type === 'success',
        'is-warning': notification.type === 'warning',
        'is-danger': notification.type === 'danger',
        'is-info': notification.type === 'info'
        }"
    >
      <button class="delete" @click="isNotifying=false"></button>
      <p class="is-size-6">{{ notification.message }}</p>
    </div>
    <div class="content-container">
      <main id="view" :class="[sidePanelIsCollapsed ? 'expanded' : '']"></main>
      <aside id="right-sidebar" :class="[sidePanelIsCollapsed ? 'collapsed' : '']">
        <div id="right-sidebar-content">
          <div id="sidebar-header" class="has-text-centered csu-energy-green-bg csu-white">
            <div class="title">ALL THE TREES</div>
            <div class="subtitle">Tree Types in the Current Map</div>
          </div>
          <div class="tree-types-container is-flex is-flex-wrap-wrap is-align-items-center m-4">
            <div v-show="this.currentTreeTypes.length == 0" class="m-4 has-text-centered">
              <div class="subtitle csu-green">Zoom in to see the types of trees displayed in the map</div>    
              <img id="centroid-logo" src="./assets/centroid-logo.png" alt="Centroid Logo" class="m-2 mt-6 ml-2">
            </div>
            <div
              v-for="treeType in currentTreeTypes"
              :key="treeType"
              class="box tree-type has-text-centered is-clickable m-2"
              :class="{ selected: selectedTreeType === treeType }"
              @click="selectTreesByType(treeType)"
            >
              <span class="is-size-6">{{ treeType }}</span>  
            </div>
          </div>
        </div>
      </aside>
    </div>

    <div id="information-modal" class="modal" :class="{ 'is-active': showingInformationModal }">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">CSU TREES INFORMATION</p>
          <button class="delete" aria-label="close" @click="showingInformationModal=false"></button>
        </header>
        <div class="card">
          <div class="card-content">
            <p class="content">
            <img width=200 src="./assets/centroid-logo.png" alt="CSU Centroid Logo showing a dark green hexagon with a large capital G in the center also shaped like a hexagon with a silhouette of a world map in the far background.">
            <div class="csu-font-color">This project was developed through a partnership between CSU Facilities Management and the Geospatial Centroid at CSU. 
            The points shown here represent all of the trees on the campus of Colorado State University and is updated periodically.</div>
            </p>
            <p class="content">
            The Geospatial Centroid, located in Morgan Library, is a resource and service center that supports the campus community on all aspects of geospatial technologies, including GIS (geographic information systems), remote sensing, web mapping and cartographic design. The Centroid employs student interns who gain hands-on skills while working on a wide and diverse range of projects for both on- and off-campus clients. For more information, drop by or visit: <a href="//www.gis.colostate.edu" target="_blank">https://gis.colostate.edu</a>
            </p>
            <small>
            This application was developed by <a href="https://brightrain.com" target="_blank">Bright Rain Solutions</a>.
            </small>
          </div>
        </div>
        <footer class="modal-card-foot">
          <button @click="showingInformationModal=false" class="button modal-close is-large" aria-label="close">OK</button>
        </footer>
      </div>
    </div>
    <div id="foothills-shortcut" class="card">
      <img src="./assets/foothills.svg" width=75 alt="Foothills Campus Shortcut" class="has-background-dark is-clickable" title="Go To Foothills Campus">
    </div>
    <div id="main-shortcut" class="card">
      <img src="./assets/oval.svg" width=75 alt="Main Campus Shortcut" class="has-background-dark is-clickable" title="Go To Main Campus">
    </div>
    `,
  
  data() {
    return {
      selectedTreeType: null, // To store the currently selected tree type
      currentTreeTypes: [],
      layersThreshold: 8000,
      isThinking: false,
      isNotifying: false,
      notification: {
        message: "",
        type: "success" // success | warning | danger | info
      },
      sidePanelIsCollapsed: false,
      showingInformationModal: false,
      informationContent: config.informationContent,
      debounceTimeout: null, // For debouncing the query
    };
  },
  
  mounted() {
    EsriConfig.apiKey = config.esriAPIKey;

    const csuEngergyBasemap = new VectorTileLayer({ portalItem: { id: config.csuTreesBasemapPortalItemId } });

    // custom vector tile basemap
    let csuTreesBasemap = new Basemap({
      baseLayers: [
        csuEngergyBasemap
      ],
      title: "CSU Base",
      id: "streets",
      thumbnailUrl: "./assets/csu-energy-basemap.png"
    });

    let esriDefaultImagery = new TileLayer({ portalItem: { id: config.esriImageryPortalItemId } });

    // ToDo: add imagery basemap option
    let imageryBasemap = new Basemap({
      baseLayers: [esriDefaultImagery],
      referenceLayers: [
        new VectorTileLayer({ portalItem: { id: config.esriImageryLabelsPortalItemId } })
      ],
      title: "Imagery",
      id: "imagery",
      thumbnailUrl: "./assets/imagery.jpg"
    });

    const map = new Map({
      basemap: csuTreesBasemap
    });

    const view = new MapView({
      map: map,
      center: [-105.1, 40.58],
      zoom: 13,
      container: "view"
    });

    view.popup.dockEnabled = true;
    view.popup.dockOptions = {
      position: "bottom-right", // Positions: "top-left", "top-right", "bottom-left", "bottom-right"
      breakpoint: false // Disable responsive dock options for small views
    };

    // this is the graphics layer used to hightlight selected trees
    rogueState.selectedTreesGraphicsLayer = new GraphicsLayer();
    map.add(rogueState.selectedTreesGraphicsLayer);

    // Define the heatmap layer with shades of green
    const heatmapLayer = new FeatureLayer({
      portalItem: { id: config.csuTreesFeatureLayerPortalItemId },
      renderer: {
        type: "heatmap",
        colorStops: [
          { color: "rgba(0, 128, 0, 0)", ratio: 0 },     // Transparent green (for low density)
          { color: "rgba(144, 238, 144, 0.5)", ratio: 0.2 }, // Light green
          { color: "rgba(60, 179, 113, 0.7)", ratio: 0.4 }, // Medium green
          { color: "rgba(34, 139, 34, 0.8)", ratio: 0.6 },  // Forest green
          { color: "rgba(0, 100, 0, 0.8)", ratio: 1 }         // Dark green (for high density)
        ],
        maxPixelIntensity: 100,
        minDensity: 0
      },
      minScale: 0,        // Visible at the closest zoom levels
      maxScale: this.layersThreshold,
      visible: true
    });

    // Add the heatmap layer to the map
    map.add(heatmapLayer);

    // Define the renderer for trees using unique values (deciduous and coniferous)
    const treeRenderer = {
      type: "unique-value",  // Renderer type: unique-value based on a field
      field: "DecidConif",   // Field that classifies the trees (deciduous or coniferous)
      uniqueValueInfos: [
        {
          // Deciduous tree symbol
          value: "D",  // Value for deciduous trees
          symbol: {
            type: "picture-marker",  // Picture marker symbol for deciduous
            url: "./assets/d-tree.png",  // URL to the custom image
            width: "24px",
            height: "24px"
          },
          label: "Deciduous"
        },
        {
          // Coniferous tree symbol
          value: "C",  // Value for coniferous trees
          symbol: {
            type: "picture-marker",  // Picture marker symbol for coniferous
            url: "./assets/c-tree.png",  // URL to the custom image
            width: "14px",
            height: "19px"
          },
          label: "Coniferous"
        }
      ]
    };

    rogueState.allTheTreesLayer = new FeatureLayer({
      portalItem: { id: config.csuTreesFeatureLayerPortalItemId },
      outFields: ["*"],
      renderer: treeRenderer,
      minScale: this.layersThreshold,        // Visible at the closest zoom levels
      maxScale: 0,
      popupTemplate: {
        title: "{New_Common}",
        content: this.setTreeContent
      }
    });
    map.add(rogueState.allTheTreesLayer);

    let basemapToggle = new BasemapToggle({
      view: view,  // The view that provides access to the map's csu custom basemap
      nextBasemap: "hybrid",
      thumbnailUrl: "./assets/csu-energy-basemap.png"
    });
    view.ui.add(basemapToggle, {
      position: "bottom-left"
    });

    view.ui.add("foothills-shortcut", "bottom-left");
    view.ui.add("main-shortcut", "bottom-left");

    view.whenLayerView(rogueState.allTheTreesLayer).then(layerView => {
      this.handleLayerReady(layerView, view);

      // Watch for extent changes and handle tree type queries
      view.watch("stationary", (isStationary) => {
        if (isStationary) {
          if(rogueState.view.scale <= this.layersThreshold) {
            this.queryTreeTypes(layerView, view);
          }
          else {
            this.currentTreeTypes = [];
            rogueState.selectedTreesGraphicsLayer.removeAll();
          }
        }
      });

      // Ensure the query runs when the layer finishes updating
      layerView.watch("updating", (isUpdating) => {
        if (!isUpdating) {
          this.queryTreeTypes(layerView, view);
        }
      });
    });

    rogueState.view = view;
  },

  methods: {
    handleLayerReady(layerView, view) {
      this.queryTreeTypes(layerView, view);
    },

    queryTreeTypes(layerView, view) {
      // Debounce the query to avoid multiple executions
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      this.debounceTimeout = setTimeout(() => {
        let query = layerView.createQuery();
        query.geometry = view.extent;
        query.returnGeometry = false;
        query.outFields = ["New_Common"];

        layerView.queryFeatures(query).then((result) => {
          let treeTypes = result.features.map(feature => feature.attributes.New_Common);
          this.currentTreeTypes = [...new Set(treeTypes)];
          //console.log("Unique tree types within the current extent:", this.currentTreeTypes);
        });
      }, 300); // 300ms debounce delay
    },

    selectTreesByType(treeType) {
      this.selectedTreeType = treeType;
      // run a query to get the tree features of the selected type using the current extent client-side
      let query = rogueState.allTheTreesLayer.createQuery();  
      query.geometry = rogueState.view.extent;
      query.where = `New_Common = '${treeType}'`;
      query.returnGeometry = true;
      query.outFields = ["New_Common"];
      rogueState.allTheTreesLayer.queryFeatures(query).then((result) => {
        // add the features to the graphics layer
        rogueState.selectedTreesGraphicsLayer.removeAll();
        result.features.forEach((feature) => {
          let graphic = {
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: "rgba(255, 255, 255, 0.5)",
              size: "32px",
              outline: {
                color: "#D9782D", // Aggie Orange!
                width: 2
              }
            },
            geometry: feature.geometry
          };
          rogueState.selectedTreesGraphicsLayer.add(graphic);
        });  
      });
    },
    setTreeContent(treeFeature) {
      // set an image for the tree by type
      /*
      blue spruce
      lodgepole pine
      ponderosa pine
      Austrian pine
      pinyon pine
      honeylocust
      hackberry
      green ash
      crabapple
      Ohio buckeye
      */
      let properties = treeFeature.graphic.attributes;
      let commonName = properties.New_Common.toString().toLowerCase();
      let description = properties.DecidConif === "C" ? "Coniferous" : "Deciduous";
      let content = `<table class="table is-bordered is-striped is-narrow is-fullwidth csu-font-color">
      <tr><td>Common Name:</td><td class="font-bold">${properties.New_Common}</td></tr>  
      <tr><td>Family:</td><td>${properties.Family}</td></tr>
        <tr><td>Species:</td><td>${properties.Genus_spec}</td></tr>
        <tr><td>Cultivar:</td><td>${properties.Cultivar}</td></tr>
        <tr><td>Type:</td><td>${description}</td></tr>
        <tr><td>Campus:</td><td>${properties.Campus}</td></tr>
        <tr><td colspan=2>${properties.Notes}</td></tr>
      </table>`;
      let imageElement = `<img src="./assets/c-tree.png">`;

      switch (commonName) {
        case "blue spruce":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2016/04/blue-spruce-tree.jpg">`;
          break;
        case "boxelder":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2016/06/BoxelderTree.jpg">`;
          break;
        case "lodgepole pine":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2014/02/lodgepole-tree2.jpg">`;
          break;
        case "ponderosa pine":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2014/02/ponderosa-tree-modern.jpg">`;
          break;
        case "austrian pine":
          imageElement = `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pin_laricio_Corse.jpg/180px-Pin_laricio_Corse.jpg">`;
          break;
        case "pinyon pine":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2016/04/pinon-tree.jpg">`;
          break;
        case "honeylocust":
        case "honey locust":
          imageElement = `<img src="http://tree-pictures.com/beautiful-honeylocust.jpg">`;
          break;
        case "hackberry":
          imageElement = `<img src="http://tree-pictures.com/hberrytree.jpg">`;
          break;
        case "green ash":
          imageElement = `<img src="http://tree-pictures.com/ash-green.jpg">`;
          break;
        case "crabapple":
          imageElement = `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Purple_prince_crabapple_tree.JPG/720px-Purple_prince_crabapple_tree.JPG">`;
          break;
        case "ohio buckeye":
          imageElement = `<img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Aesculus_glabra_var._glabra.jpg">`;
          break;
        case "rocky mountain juniper":
          imageElement = `<img src="https://csfs.colostate.edu/wp-content/uploads/2016/04/RMJuniper-tree.jpg">`;
          break;
        case "littleleaf linden":
          imageElement = `<img src="https://shop-static.arborday.org/media/0004010_littleleaf-linden_510.jpeg">`;
          break;
        default:
          if (properties.DecidConif === "D") {
            imageElement = `<img src="./assets/deciduous.svg">`;
          } else if (properties.DecidConif === "C") {
            imageElement = `<img src="./assets/coniferous.svg">`;
          } else {
            imageElement = `<img src="./assets/c-tree.png">`;
          }
          break;
      }
      return content + imageElement;
    },
    toggleSidePanel() {
      this.sidePanelIsCollapsed = !this.sidePanelIsCollapsed;
    },

    notify(message, type, duration = 5000) {
      this.notification.message = message;
      this.notification.type = type;
      this.isNotifying = true;
      setTimeout(() => {
        this.isNotifying = false;
      }, duration);
    }
  },

  components: {
    'collapsible-panel': CollapsiblePanel
  }
}).mount("#app");
