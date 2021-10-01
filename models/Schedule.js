const mongoose = require('mongoose');
const AgentSchema = require('./Agent').schema;

const ShiftSchema = new mongoose.Schema({
    name: String,
    activityId: String,
    absenceId: String,
    displayColorHex: String,
    overtime: String,
    startTime: String,
    endTime: String,
    lengthOfShift: {
      type: Number,
      required: true
    },
    offset: {
      type: Number,
      required: true
    }
});

const ScheduleSchema = new mongoose.Schema({
    agentId: {
        type: String,
        required: true,
        ref: 'Agent'
    },
    date: {
        type: String,
        required: true
    },
    dayOff: {
        name: String,
        displayColorHex: String
    },
    shift: [ShiftSchema],
    agent: AgentSchema,
    expireAt: {
      required: true,
      type: Date,
      default: Date.now,
      index: {expires: '3d'}
    }
}, {timestamps: true});

module.exports = mongoose.model('Schedule', ScheduleSchema);

/*
{
  PersonId: '9019383b-e935-4b5e-9682-a70e00bb61d3',
  Date: '2021-06-28',
  Shift: [
    {
      Name: 'Administration',
      Period: [Object],
      ActivityId: '2ace0d22-8e41-469b-8782-a1b8011469bf',
      AbsenceId: null,
      DisplayColor: -8372160,
      DisplayColorHex: '#804040',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T05:30:00Z',
      EndTime: '2021-06-28T07:30:00Z'
    },
    {
      Name: 'Break',
      Period: [Object],
      ActivityId: '7269775e-388e-45eb-9468-a1b600fbce0c',
      AbsenceId: null,
      DisplayColor: -128,
      DisplayColorHex: '#FFFF80',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T07:30:00Z',
      EndTime: '2021-06-28T07:45:00Z'
    },
    {
      Name: 'Administration',
      Period: [Object],
      ActivityId: '2ace0d22-8e41-469b-8782-a1b8011469bf',
      AbsenceId: null,
      DisplayColor: -8372160,
      DisplayColorHex: '#804040',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T07:45:00Z',
      EndTime: '2021-06-28T10:00:00Z'
    },
    {
      Name: 'Lunch',
      Period: [Object],
      ActivityId: 'c19c7b52-86d3-4d5d-b037-a1b600fbc5e5',
      AbsenceId: null,
      DisplayColor: -256,
      DisplayColorHex: '#FFFF00',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T10:00:00Z',
      EndTime: '2021-06-28T10:30:00Z'
    },
    {
      Name: 'Administration',
      Period: [Object],
      ActivityId: '2ace0d22-8e41-469b-8782-a1b8011469bf',
      AbsenceId: null,
      DisplayColor: -8372160,
      DisplayColorHex: '#804040',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T10:30:00Z',
      EndTime: '2021-06-28T12:15:00Z'
    },
    {
      Name: 'Break UnP',
      Period: [Object],
      ActivityId: 'edf205fd-601f-4ec2-917e-a6da00b6ae33',
      AbsenceId: null,
      DisplayColor: -128,
      DisplayColorHex: '#FFFF80',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T12:15:00Z',
      EndTime: '2021-06-28T12:30:00Z'
    },
    {
      Name: 'Administration',
      Period: [Object],
      ActivityId: '2ace0d22-8e41-469b-8782-a1b8011469bf',
      AbsenceId: null,
      DisplayColor: -8372160,
      DisplayColorHex: '#804040',
      ExternalMeetingId: null,
      Overtime: null,
      StartTime: '2021-06-28T12:30:00Z',
      EndTime: '2021-06-28T13:45:00Z'
    }
  ],
  DayOff: null
}
*/