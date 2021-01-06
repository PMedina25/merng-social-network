import React, {useState} from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { Button, Confirm, Icon } from 'semantic-ui-react';

import { FETCH_POSTS_QUERY } from '../util/graphql';
import MyPopup from '../util/MyPopup';

function DeleteButton({ postId, commentId, callback }) {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

    const [deletePostOrMutation] = useMutation(mutation, {
        // Once we reach the update, this needs that the post has been deleted successfully
        update(proxy) {
            setConfirmOpen(false);
            
            if (!commentId) {
                // This reads the data that is in the cache
                const data = proxy.readQuery({
                    query: FETCH_POSTS_QUERY
                });
                // This is for caching while deleting posts. This displays the posts after the delete immediately in the frontend
                proxy.writeQuery({ 
                    query: FETCH_POSTS_QUERY,
                    data: {
                        getPosts: data.getPosts.filter((p) => p.id !== postId)
                    }
                });
            }

            if (callback) callback();
        },
        variables: {
            postId,
            commentId
        }
    });

    return (
        <>
        <MyPopup content={commentId ? 'Delete comment' : 'Delete post'}>
            <Button as="div" color="red" floated="right" onClick={()=> setConfirmOpen(true)}>
                <Icon name="trash" style={{margin: 0}} />
            </Button>
        </MyPopup>
        <Confirm 
            open={confirmOpen}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={deletePostOrMutation}
        />
        </>
    );
}

const DELETE_POST_MUTATION = gql`
    mutation deletePost($postId: ID!) {
        deletePost(postId: $postId)
    }
`;

const DELETE_COMMENT_MUTATION = gql`
    mutation deleteComment($postId: ID!, $commentId: ID!) {
        deleteComment(postId: $postId, commentId: $commentId) {
            id
            comments {
                id
                username
                createdAt
                body
            }
            commentCount
        }
    }
`

export default DeleteButton;
