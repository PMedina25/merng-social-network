import React from 'react'
import { Button, Form } from 'semantic-ui-react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';

import { useForm } from '../util/hooks';
import { FETCH_POSTS_QUERY } from '../util/graphql';

function PostForm() {

    const { values, onChange, onSubmit } = useForm(createPostCallback, {
        body: ''
    });

    const [createPost, { error }] = useMutation(CREATE_POST_MUTATION, {
        variables: values,
        update(proxy, result) {
            // This reads the data that is in the cache
            let data = proxy.readQuery({
                query: FETCH_POSTS_QUERY
            });
            // This is for caching while adding posts. This displays the post added immediately in the frontend
            proxy.writeQuery({ 
                query: FETCH_POSTS_QUERY, 
                data: {
                    getPosts: [result.data.createPost, ...data.getPosts]
                }});
            values.body = ''
        }
    });

    function createPostCallback() {
        createPost()
    }

    // <> is the shorthand for fragment
    return (
        <>  
         <Form onSubmit={onSubmit}>
            <h2>Create a post:</h2>
            <Form.Field>
                <Form.Input 
                    placeholder="Hi World!"
                    name="body"
                    onChange={onChange}
                    value={values.body}
                    error={error ? true : false }
                />
                <Button type="submit" color="teal">
                    Submit
                </Button>
            </Form.Field>
        </Form>
        {error && (
            <div className="ui error message" style={{marginBottom: 20}}>
                <ul className="list">
                <li>{error.graphQLErrors[0].message}</li>
                </ul>
            </div>
        )}
       </>
    );
}

const CREATE_POST_MUTATION = gql`
    mutation createPost($body: String!) {
        createPost(body: $body) {
            id
            body
            createdAt
            username
            likes {
                id
                username
                createdAt
            }
            likeCount
            comments {
                id 
                body
                username
                createdAt
            }
            commentCount
        }
    }
`

export default PostForm;
