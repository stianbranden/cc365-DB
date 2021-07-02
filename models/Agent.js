const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      default: 'hasnoemail@elkjop.no'
    },
    businessUnitName: {
      type: String
    },
    businessUnitId: {
      type: String
    },
    departmentName: {
      type: String
    },
    teamName: {
      type: String
    },
    teamId: {
      type: String
    },
    timeZone: {
      type: String,
      required: true,
      default: 'Europe/Oslo'
    }
});

module.exports = mongoose.model('Agent', AgentSchema);

/*
{
    Id: '9019383b-e935-4b5e-9682-a70e00bb61d3',
    FirstName: 'Nadia',
    LastName: 'Boujrad',
    EmploymentNumber: '212726',
    Email: 'nadiabo@giganten.dk',
    DisplayName: 'Nadia Boujrad',
    TimeZoneId: 'Europe/Berlin',
    BusinessUnitId: '5f63f20c-7a0e-4735-bc4b-a1b000b68adf',
    SiteId: 'ea5a54c9-37ff-4327-8f79-a1b600d749a7',
    TeamId: 'c48d362c-13f6-4bb8-9815-aa01008039d0',
    WorkflowControlSetId: '833f3f5a-3409-43d6-95d8-a1c600b78962',
    FirstDayOfWeek: 1
  },
  */