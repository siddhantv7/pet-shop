App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.pet-quantity').text('Available Quantity: ' + data[i].quantity); // Display initial quantity
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    if(window.ethereum){
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.request({method : "eth_requestAccounts"});;
      } catch (error){
        console.log("User denied account access");
      }
    } else if (window.web3){
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:7545");
    }

    web3 = new Web3(App.web3Provider);
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function (data){
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
      App.contracts.Adoption.setProvider(App.web3Provider);
      return App.markAdopted();
    })

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  handleAdopt: function (event) {
    event.preventDefault();
    var adoptButton = $(event.target);
    var petId = parseInt(adoptButton.data('id'));

    // Disable the adopt button to prevent multiple clicks
    adoptButton.prop('disabled', true);

    var adoptionInstance;
    web3.eth.getAccounts(function (error, accounts) {
        if (error) {
            console.error(error);
            // Re-enable the adopt button in case of error
            adoptButton.prop('disabled', false);
            return;
        }

        var account = accounts[0];
        App.contracts.Adoption.deployed().then(function (instance) {
            adoptionInstance = instance;
            return adoptionInstance.adopt(petId, { from: account });
        }).then(function (result) {
            // Update the UI after adoption
            return App.updateUI(petId);
        }).catch(function (err) {
            console.error(err);
            // Re-enable the adopt button in case of error
            adoptButton.prop('disabled', false);
        });
    });
},

updateUI: function (petId) {
    var adoptionInstance;
    App.contracts.Adoption.deployed().then(function (instance) {
        adoptionInstance = instance;
        return adoptionInstance.getAdopters.call();
    }).then(function (adopters) {
        for (var i = 0; i < adopters.length; i++) {
            if (adopters[i] !== '0x0000000000000000000000000000000000000000' && i === petId) {
                // Get the current text content of the element
                var currentQuantityText = $('.panel-pet').eq(i).find('.pet-quantity').text();
                // Extract the numeric part of the text content
                var numericPart = currentQuantityText.replace('Available Quantity: ', '');
                // Parse the numeric part into a number
                var currentQuantity = parseInt(numericPart);
                // Decrease the number by a certain value (for example, 1), ensuring it doesn't go below 0
                var newQuantity = Math.max(currentQuantity - 1, 0);
                // Update the text content of the element with the new value
                $('.panel-pet').eq(i).find('.pet-quantity').text('Available Quantity: ' + newQuantity);
                break; // Exit the loop once the quantity for the adopted pet is updated
            }
        }
    }).catch(function (err) {
        console.log(err.message);
    });
}


};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
