liquid-if .background showBackground use='fade'
status-bar .status
.mode click='toggleMode' = mode
liquid-bind .date date use='toLeft'
live-clock .clock date=false
= input class=open value=value enter='enter'
.spacer
