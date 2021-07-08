<template>
    <div :class="commentObject.color" :style="highlight ? {backgroundColor: '#fef4dd'} : {}">
      <v-row>
        <v-col class="pa-0 iconCol" md="auto">
          <v-icon :size="iconSize">{{ commentObject.icon }}</v-icon>
        </v-col>
        <v-col class="pa-0 header-col">
          <p class="username mb-0" href="#">
            <strong>{{ commentObject.name }}</strong> at {{ commentObject.timestamp}}
          </p>
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
              :disabled="document.fileSize===0"
            ></DocumentChip>
        </v-row>
        </v-col>
      </v-row>
    </div>
</template>

<script>
import DocumentChip from './DocumentChip.vue';
import {LocalDateTime, DateTimeFormatter} from '@js-joda/core';
import {Locale} from '@js-joda/locale_en-us';

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

      const readableTime = d.dateTime;
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
        dateTime: retrievedTimestamp.format(DateTimeFormatter.ofPattern('yyyy-MM-dd h:ma').withLocale(Locale.US)).toLowerCase()
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
  max-width: 100%;
  padding-right: 1.5em;
}
</style>
