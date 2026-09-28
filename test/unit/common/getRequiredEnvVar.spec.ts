import { getRequiredEnvVar } from "../../../src/common/getRequiredEnvVar.js"
import { describe, it, expect } from 'vitest';

describe('getRequiredEnvVar', () => {
    it('When given a variable that exists in env, returns the value', () => {
        process.env.TEST_VAR = 'HELLO'
        const res = getRequiredEnvVar('TEST_VAR')

        expect(res).toBe('HELLO')
    })

    it('When given a variable that doesnt exist in env, throws a Error', async () => {
        
        try {
            getRequiredEnvVar('THIS_DOES_NOT_EXIST')
            assert(false)
        } catch (error)
        {
            if(error instanceof Error)
                expect(error.message).toBe('Missing environment variable name THIS_DOES_NOT_EXIST')
            else
                assert(false)
        } 
    })
})