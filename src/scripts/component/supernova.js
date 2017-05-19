'use strict';

angular.module('incremental').component('supernova', {
  templateUrl: 'views/supernova.html',
  controller: ['state', 'format', 'visibility', 'data','util',supernova],
  controllerAs: 'ct'
});

function supernova(state, format, visibility, data, util) {
  let ct = this;
  ct.state = state;
  ct.visibility = visibility;
  ct.data = data;
  ct.util = util;
  ct.format = format;

  ct.exoticProduction = function(){
    let production = {};
    let exotic = data.elements[state.current_element].exotic;
    production[exotic] = 0;
    for(let resource of data.elements[state.current_element].includes){
      if(!state.player.resources[resource].unlocked){
        continue;
      }
      if(data.resources[resource].type.indexOf('molecule') !== -1){
        let multiplier = 0;
        for(let key in data.resources[resource].elements){
          let number = data.resources[resource].elements[key];
          multiplier += number;
        }
        for(let element in data.resources[resource].elements){
          let newExotic = data.elements[element].exotic;
          production[newExotic] = production[newExotic] || 0;
          production[newExotic] += Math.floor(Math.sqrt(state.player.resources[resource].number))*multiplier;
        }
      }
      production[exotic] += Math.floor(Math.sqrt(state.player.resources[resource].number));
    }
    for(let key in production){
      // we adjust the production to start at 1e6 resources
      if(production[key] >= 1000){
        production[key] -= 1000;
      }else{
        production[key] = 0;
      }
    }

    return production;
  };

  ct.prestige = function(){
    let resources = state.player.resources;
    let production = ct.exoticProduction();

    for(let key in production){
      resources[key].number += production[key];
      resources[key].unlocked = true;
    }

    for(let resource of data.elements[state.current_element].includes){
      resources[resource].number = 0;
    }

    let upgrades = state.player.elements[state.current_element].upgrades;
    for(let upgrade in upgrades){
      upgrades[upgrade] = false;
    }

    let generators = state.player.elements[state.current_element].generators;
    for(let generator in generators){
      generators[generator] = 0;
    }

    let syntheses = data.elements[state.current_element].syntheses;
    for(let synthesis of syntheses){
      state.player.syntheses[synthesis].active = 0;
    }
    delete generators['0'];
    let first = Object.keys(generators)[0];

    state.player.elements[state.current_element].generators[first] = 1;
  };
}