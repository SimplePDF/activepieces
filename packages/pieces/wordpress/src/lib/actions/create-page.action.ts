import { createAction, Property } from "@activepieces/pieces-framework";
import { wordpressCommon } from "../common";
import { httpClient, HttpMethod, HttpRequest, AuthenticationType } from "@activepieces/pieces-common";


export const createWordpressPage = createAction({
    name: 'create_page',
    description: 'Create new page on Wordpress',
    displayName: 'Create Page',
    props: {
        connection: wordpressCommon.connection,
        website_url: wordpressCommon.website_url,
        title: Property.ShortText({
            description: 'Title of the page about to be added',
            displayName: 'Title',
            required: true,
        }),
        content: Property.LongText({
            description: 'Uses the WordPress Text Editor which supports HTML',
            displayName: 'Content',
            required: true
        }),
        slug: Property.ShortText({
            displayName: 'Slug',
            required: false,
        }),
        date: Property.ShortText({
            description: 'Page publish date (ISO-8601)',
            displayName: 'Date',
            required: false,
        }),
        status: Property.StaticDropdown({
            description: 'Choose status',
            displayName: 'Status',
            required: false,
            options: {
                disabled: false, options: [
                    { value: 'publish', label: 'Published' },
                    { value: 'future', label: 'Scheduled' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'private', label: 'Private' }
                ]
            }
        }),
        excerpt: Property.LongText({
            description: 'Uses the WordPress Text Editor which supports HTML',
            displayName: 'Excerpt',
            required: false
        }),
        comment_status: Property.Checkbox({
            displayName: 'Enable Comments',
            required: false
        }),
        ping_status: Property.Checkbox({
            displayName: 'Open to Pinging',
            required: false
        }),
    },
    async run(context) {
        if (!(await wordpressCommon.urlExists(context.propsValue.website_url.trim()))) {
            throw new Error('Website url is invalid: ' + context.propsValue.website_url);
        }
        const requestBody: Record<string, unknown> = {};
        if (context.propsValue.date) {
            requestBody['date'] = context.propsValue.date;
        }
        if (context.propsValue.comment_status !== undefined) {
            requestBody['comment_status'] = context.propsValue.comment_status ? 'open' : 'closed';
        }
        if (context.propsValue.slug) {
            requestBody['slug'] = context.propsValue.slug;
        }
        if (context.propsValue.excerpt) {
            requestBody['excerpt'] = context.propsValue.excerpt;
        }
        if (context.propsValue.status !== undefined) {
            requestBody['status'] = context.propsValue.status;
        }
        requestBody['content'] = context.propsValue.content;
        requestBody['title'] = context.propsValue.title;
        const request: HttpRequest = {
            method: HttpMethod.POST,
            url: `${context.propsValue.website_url.trim()}/wp-json/wp/v2/pages`,
            authentication: {
                type: AuthenticationType.BASIC,
                username: context.propsValue.connection.username,
                password: context.propsValue.connection.password,
            },
            body: requestBody
        };
        const response = await httpClient.sendRequest<{ id: string, name: string }[]>(request);
        return response;
    }
});
