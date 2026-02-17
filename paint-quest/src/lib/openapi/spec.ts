export function buildOpenApiSpec(baseUrl: string) {
    return {
        openapi: '3.0.3',
        info: {
            title: 'PaintQuest API',
            version: '1.0.0',
            description:
                'API documentation for PaintQuest. Most endpoints require an authenticated Supabase session cookie.',
        },
        servers: [{ url: baseUrl }],
        tags: [
            { name: 'Attempts' },
            { name: 'Tasks' },
            { name: 'Recommendations' },
            { name: 'Quests' },
            { name: 'Profile' },
            { name: 'Arsenal' },
        ],
        components: {
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: { error: { type: 'string' } },
                },
                TaskInput: {
                    type: 'object',
                    properties: {
                        title: { type: 'string' },
                        game: { type: 'string', nullable: true },
                        mfg: { type: 'string', nullable: true },
                        estimated_minutes_min: { type: 'integer', nullable: true },
                        estimated_minutes_max: { type: 'integer', nullable: true },
                        priority: { type: 'integer' },
                        required_tools_tags: { type: 'array', items: { type: 'string' } },
                        skills_tags: { type: 'array', items: { type: 'string' } },
                        status: {
                            type: 'string',
                            enum: ['backlog', 'active', 'done', 'someday', 'archived'],
                        },
                    },
                },
                CreateQuestInput: {
                    type: 'object',
                    required: ['taskId'],
                    properties: { taskId: { type: 'string', format: 'uuid' } },
                },
                CreateAttemptInput: {
                    type: 'object',
                    properties: { autoStart: { type: 'boolean' } },
                },
                ProgressEventInput: {
                    type: 'object',
                    required: ['eventType'],
                    properties: {
                        eventType: {
                            type: 'string',
                            enum: ['ATTEMPT_STARTED', 'PROGRESS_RECORDED', 'COMPLETED', 'ABANDONED'],
                        },
                        payload: { nullable: true },
                    },
                },
                AttemptEntryInput: {
                    type: 'object',
                    required: ['entryType', 'content'],
                    properties: {
                        entryType: { type: 'string' },
                        content: {},
                    },
                },
                BulkPaintRow: {
                    type: 'object',
                    required: ['color'],
                    properties: {
                        color: { type: 'string' },
                        brand: { type: 'string', nullable: true },
                        medium: { type: 'string', nullable: true },
                        available: { type: 'boolean' },
                    },
                },
            },
        },
        paths: {
            '/api/attempts': {
                post: {
                    tags: ['Attempts'],
                    summary: 'Create a new attempt',
                    requestBody: {
                        required: false,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CreateAttemptInput' },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Attempt created' },
                        '401': { description: 'Not authenticated' },
                        '409': { description: 'Another attempt is already in progress' },
                        '400': { description: 'Invalid request' },
                    },
                },
            },
            '/api/attempts/{attemptId}/events': {
                post: {
                    tags: ['Attempts'],
                    summary: 'Append progress event to an attempt',
                    parameters: [
                        {
                            in: 'path',
                            name: 'attemptId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ProgressEventInput' },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Event recorded' },
                        '400': { description: 'Validation error' },
                    },
                },
            },
            '/api/attempts/{attemptId}/entries': {
                post: {
                    tags: ['Attempts'],
                    summary: 'Add attempt entry',
                    parameters: [
                        {
                            in: 'path',
                            name: 'attemptId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/AttemptEntryInput' },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Entry created' },
                        '400': { description: 'Validation error' },
                    },
                },
            },
            '/api/tasks': {
                get: {
                    tags: ['Tasks'],
                    summary: 'List tasks',
                    responses: { '200': { description: 'Tasks loaded' } },
                },
                post: {
                    tags: ['Tasks'],
                    summary: 'Create task',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskInput' },
                            },
                        },
                    },
                    responses: { '200': { description: 'Task created' } },
                },
            },
            '/api/tasks/{taskId}': {
                get: {
                    tags: ['Tasks'],
                    summary: 'Get task by id',
                    parameters: [
                        {
                            in: 'path',
                            name: 'taskId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    responses: { '200': { description: 'Task loaded' } },
                },
                patch: {
                    tags: ['Tasks'],
                    summary: 'Update task',
                    parameters: [
                        {
                            in: 'path',
                            name: 'taskId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/TaskInput' },
                            },
                        },
                    },
                    responses: { '200': { description: 'Task updated' } },
                },
                delete: {
                    tags: ['Tasks'],
                    summary: 'Archive task',
                    parameters: [
                        {
                            in: 'path',
                            name: 'taskId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    responses: { '200': { description: 'Task archived' } },
                },
            },
            '/api/tasks/seed': {
                post: {
                    tags: ['Tasks'],
                    summary: 'Create default starter tasks',
                    responses: {
                        '200': { description: 'Starter tasks created' },
                        '401': { description: 'Not authenticated' },
                    },
                },
            },
            '/api/recommendations': {
                get: {
                    tags: ['Recommendations'],
                    summary: 'Get recommended quests',
                    parameters: [
                        {
                            in: 'query',
                            name: 'minutes',
                            required: true,
                            schema: { type: 'integer', minimum: 1 },
                        },
                        {
                            in: 'query',
                            name: 'debug',
                            required: false,
                            schema: { type: 'string', enum: ['0', '1'] },
                        },
                    ],
                    responses: {
                        '200': { description: 'Recommendations calculated' },
                        '400': { description: 'Invalid query params' },
                        '401': { description: 'Not authenticated' },
                    },
                },
            },
            '/api/quests': {
                post: {
                    tags: ['Quests'],
                    summary: 'Create quest attempt from task',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/CreateQuestInput' },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Quest attempt created' },
                        '409': { description: 'Another attempt is already in progress' },
                    },
                },
            },
            '/api/profile': {
                get: {
                    tags: ['Profile'],
                    summary: 'Get current user profile',
                    responses: { '200': { description: 'Profile loaded' } },
                },
                post: {
                    tags: ['Profile'],
                    summary: 'Create/update profile',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                            },
                        },
                    },
                    responses: { '200': { description: 'Profile saved' } },
                },
            },
            '/api/arsenal': {
                get: {
                    tags: ['Arsenal'],
                    summary: 'List arsenal items',
                    responses: { '200': { description: 'Arsenal loaded' } },
                },
                post: {
                    tags: ['Arsenal'],
                    summary: 'Create arsenal item',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: { type: 'object' },
                            },
                        },
                    },
                    responses: { '200': { description: 'Arsenal item created' } },
                },
            },
            '/api/arsenal/{itemId}': {
                patch: {
                    tags: ['Arsenal'],
                    summary: 'Update arsenal item',
                    parameters: [
                        {
                            in: 'path',
                            name: 'itemId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    requestBody: {
                        required: true,
                        content: { 'application/json': { schema: { type: 'object' } } },
                    },
                    responses: { '200': { description: 'Arsenal item updated' } },
                },
                delete: {
                    tags: ['Arsenal'],
                    summary: 'Delete arsenal item',
                    parameters: [
                        {
                            in: 'path',
                            name: 'itemId',
                            required: true,
                            schema: { type: 'string', format: 'uuid' },
                        },
                    ],
                    responses: { '200': { description: 'Arsenal item deleted' } },
                },
            },
            '/api/arsenal/bulk-paint': {
                post: {
                    tags: ['Arsenal'],
                    summary: 'Bulk import paint items',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        rows: {
                                            type: 'array',
                                            items: { $ref: '#/components/schemas/BulkPaintRow' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    responses: {
                        '200': { description: 'Bulk import completed' },
                        '400': { description: 'Invalid payload' },
                    },
                },
            },
        },
    }
}
