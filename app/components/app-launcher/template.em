liquid-if .background showBackground use='fade'
liquid-bind .date date use='toLeft'
live-clock .clock date=false
unless windowManager.isEmpty: .mode click='toggleMode' class=mode
= input class=open value=value enter='go' escape-press='close'
.search class=search.results::empty
  each search.results as |result|
    .result click="'go' result.url" class=result.type: = result.title
  else
    .messages click='openMessages'
    .calendar click='openCalendar'
    .notes click='openNotes'
