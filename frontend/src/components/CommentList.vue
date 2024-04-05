<template>
  <v-list class="pa-0">
    <v-list-item
      v-for="item in listItems"
      :key="item.id"
      :prepend-icon="item.icon"
      :class="item.color"
      rounded="true"
    >
      <template #title>
        <strong>{{ item.name }}</strong> at {{ item.timestamp }}
      </template>
      <template #default>
        <v-row>
          <v-col cols="12">
            {{ item.content }}
          </v-col>
        </v-row>
        <v-row v-if="item.documents.length > 0">
          <v-col cols="12">
            <DocumentChip
              v-for="document in item.documents"
              :key="document.documentID"
              :document="document"
              :undeletable="true"
              :disabled="document.fileSize === 0"
            />
          </v-col>
        </v-row>
      </template>
    </v-list-item>
  </v-list>
</template>

<script>
import DocumentChip from './DocumentChip.vue';

export default {
  components: {
    DocumentChip
  },
  props: {
    comments: {
      type: Array,
      requried: true,
      default: () => []
    },
    user: {
      type: Object,
      requried: true,
      default: () => {}
    },
    participants: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  computed: {
    listItems() {
      return Array.isArray(this.comments) ? this.comments.map(this.toCommentListItem) : [];
    },
  },
  methods: {
    toCommentListItem(comment) {
      let listItem = {
        id: `${comment.participantId}-${comment.timestamp}`,
        content: comment.content,
        timestamp: comment.readableTime,
        documents: comment.documents || []
      };

      if (comment.myself) {
        listItem.name = this.user.name;
        listItem.color = 'studentGreen';
        listItem.icon = 'mdi-information';
      } else {
        const participant = this.participants.find(element => comment.participantId === element.id);
        listItem.name = participant ? participant.name : 'PEN Admin';
        listItem.color = 'adminBlue';
        listItem.icon = 'mdi-help-circle';
      }

      return listItem;
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
.username {
  padding-left: 0.5rem;
  padding-right: 0.1rem;
  font-size: 0.85rem;
}
.timestamp {
  font-size: 0.72rem;
  color: rgba(0, 0, 0, 0.38)
}
.header-row {
  padding-bottom: 0;
}
.header-col {
  padding-top: 0;
  padding-bottom: 0;
}
.content-col {
  padding: 0.2rem 0.5rem 0.2rem 1rem;
}
.studentGreen {
  background-color: #E9F2DF;
}
.adminBlue {
  background-color: #F2F2F2;
}
.iconCol {
  flex-grow: 0
}
.commentContent {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-width: 100%;
  padding-right: 1.5em;
}
</style>
