<template>
    <div :class="commentObject.color" :style="highlight ? {backgroundColor: '#fef4dd'} : {}">
      <v-row>
          <v-col class="pa-0 iconCol" md="auto">
              <!-- <v-avatar> -->
                  <v-icon :size="iconSize">{{ commentObject.icon }}</v-icon>
              <!-- </v-avatar> -->
          </v-col>
          <v-col class="pa-0 header-col">
            <p class="username mb-0" href="#">
                <strong>{{ commentObject.name }}</strong> at {{ commentObject.timestamp}}
            </p>
            <!-- <p class="timestamp"> 
              On {{ commentObject.timestamp}},
              <strong>{{ commentObject.name }}</strong> said:
            </p> -->
          </v-col>
      </v-row>
      <v-row class="ml-6 ml-sm-7 mr-1">
        <v-col class="content-col">
        <v-row class="mb-1">
          <span :class="{commentContent: comment.content && comment.content.length > 0}" :style="highlight ? {fontWeight: 'bold'} : {}">{{ commentObject.content }}</span>
        </v-row>
        <v-row>
            <DocumentChip
              v-for="document in comment.documents"
              :document="document"
              :key="document.documentID"
              :undeletable="true"
            ></DocumentChip>
        </v-row>
        </v-col>
      </v-row>
    </div>
</template>

<script>
import DocumentChip from './DocumentChip.vue';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';

export default {
  components: {
    DocumentChip
  },
  props: {
    comment: {
      type: Object,
      required: true
    },
    myself: {
      type: Object,
      required: true
    },
    participants: {
      type: Array,
      required: true
    },
    highlight: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    commentObject() {
      const d = this.toTimeObject(this.comment.timestamp);
      let amPm = 'am';
      //let hours = d.hour;
      if(d.hour > 12){
        amPm = 'pm';
        d.hour = d.hour - 12;
        //changes from 24 hour to 12 hour
      }
      
      //split the hour/minute object, make fixes, then add it back to the datatime object
      let fixTime = d.dateTime;
      fixTime = (d.dateTime).split(' ');
      fixTime[1] = String(d.hour) + ':' +  d.minute;
      fixTime = fixTime.join(' ');
  

      // d.dayOfWeek = d.dayOfWeek.toLower();
      // d.month = d.month.pascalCase();
      //d.month = d.month.substring(0, 3);
      //const readableTime = d.month + ' ' + d.day + ', ' + d.year + ' ' + hours + ':' + d.minute + ' ' + amPm;
      const readableTime = fixTime + amPm; //d.year + '-' + d.month + '-' + d.day + ' ' + hours + ':' + d.minute + ' ' + amPm;
      if(this.comment.myself){
        return {
          name: this.myself.name,
          content: this.comment.content,
          timestamp: readableTime,
          color: 'studentGreen',
          icon: '$info'
        };
      } else {
        const participant = this.participants.find(element => this.comment.participantId === element.id);
        return {
          name: participant ? participant.name : 'PEN Admin',
          content: this.comment.content,
          timestamp: readableTime,
          color: 'adminBlue',
          icon: '$question'
        };
      }
    },
    iconSize() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs': return '22px';
      case 'sm': return '25px';
      case 'md': return '25px';
      case 'lg': return '28px';
      case 'xl': return '28px';
      default: return '25px';
      }
    }
  },
  mounted() {

  },
  methods: {
    toPascal(str){
      return str.replace(/\w\S*/g, m => m.charAt(0).toUpperCase() + m.substr(1).toLowerCase());
    },
    toTimeObject(timestamp) {
      if(timestamp.length>23){
        timestamp = timestamp.substring(0,23);
      }

      const retrievedTimestamp = LocalDateTime.parse(timestamp);
      let minute =  retrievedTimestamp.minute();
      if(retrievedTimestamp.minute() < 10){
        minute = '0' + retrievedTimestamp.minute();
      }
      return {
        year: retrievedTimestamp.year(),
        month: retrievedTimestamp.month().name(),// this will show month name as ex:- DECEMBER not value 12.
        monthValue: retrievedTimestamp.monthValue(),
        day: retrievedTimestamp.dayOfMonth(),
        hour: retrievedTimestamp.hour(),
        minute: minute,
        second: retrievedTimestamp.second(),
        millisecond: retrievedTimestamp.nano(),
        dayOfWeek: retrievedTimestamp.dayOfWeek(),
        dateTime: retrievedTimestamp.format(DateTimeFormatter.ofPattern('yyyy-MM-dd h:m')) 
      };
    }
  }
};
</script>

<style scoped>
.comment .avatar {
    align-self: flex-start;
}
.comment .avatar > img {
    width: 3rem;
    height: 3rem;
    border-radius: 100%;
    align-self: start;
}
.comment .text {
    text-align: left;
    margin-left: 0.5rem;
}
.comment .text span {
    margin-left: 0.5rem;
}
.comment .text .username {
    font-weight: bold;
    color: #333;
}
.username{
  padding-left: 0.5rem;
  padding-right: 0.1rem;
  font-size: 0.85rem;
}
.timestamp{
  font-size: 0.72rem;
  color: rgba(0, 0, 0, 0.38)
}
.header-row{
  padding-bottom: 0;
}
.header-col{
  padding-top: 0;
  padding-bottom: 0;
}
.content-col{
  padding: 0.2rem 0.5rem 0.2rem 1rem;
}
.studentGreen{
  background-color: #E9F2DF;
  padding: 0.5rem;
  align-items: center;
  color: #333;
  border-bottom: 1px solid #97888e;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
.adminBlue{
  background-color: #F2F2F2;
  padding: 0.5rem;

  align-items: center;
  color: #333;
  border-bottom: 1px solid #97888e;
  box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}
.iconCol{
  flex-grow: 0
}
.commentContent {
  white-space: pre-wrap; 
  word-wrap: break-word;
}
</style>
