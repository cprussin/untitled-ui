liquid-if .background showBackground use='fade'
liquid-bind .date date use='toLeft'
live-clock .clock date=false
unless windowManager.isEmpty: .mode click='toggleMode' class=mode
= input class=open value=value enter='go' escape-press='close'
.spacer
.shortcuts
  .messages click='openMessages'
  .calendar click='openCalendar'
  .notes click='openNotes'
.spacer
