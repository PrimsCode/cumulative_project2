"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

//added Admin user token - u2AdminToken
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2AdminToken,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "job_new",
    salary: 20000,
    equity: "0",
    companyHandle: "c1"
  };

  //Test for admin user
  test("ok for admin user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        ...newJob,
        id: expect.any(Number)
      }
    });
  });

  //Test to check for unauthorization when user is not admin
  test("failed because not admin user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 10,
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /companies */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
        jobs:
        [{
          id: expect.any(Number),
          title: "job_c1",
          salary: 100,
          equity: "0",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "job_c2",
          salary: 1000,
          equity: "1",
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "job_c3",
          salary: 10000,
          equity: "0",
          companyHandle: "c3"
        },],
    });
  });

  //testing filter for title
  test("filter test for title", async function() {
    const resp = await request(app).get("/jobs").query({title: "job_c1"});
    expect(resp.body).toEqual({
      jobs: [
        {
            id: expect.any(Number),
            title: "job_c1",
            salary: 100,
            equity: "0",
            companyHandle: "c1"
        }
      ]
    })
  })

  //testing filter for minSalary
  test("filter test for minSalary", async function() {
    const resp = await request(app).get("/jobs").query({minSalary: 1000});
    expect(resp.body).toEqual({
      jobs: [
        {
            id: expect.any(Number),
            title: "job_c2",
            salary: 1000,
            equity: "1",
            companyHandle: "c2"
          },
          {
            id: expect.any(Number),
            title: "job_c3",
            salary: 10000,
            equity: "0",
            companyHandle: "c3"
          }
      ]
    })
  })

  //testing filter for hasEquity
  test("filter test for hasEquity", async function() {
    const resp = await request(app).get("/jobs").query({ hasEquity: true});
    expect(resp.body).toEqual({
        jobs: [
            {
                id: expect.any(Number),
                title: "job_c2",
                salary: 1000,
                equity: "1",
                companyHandle: "c2"
              }
        ]
      })
    })

  //testing invalid filter request
  test("invalid filter request", async function() {
    const resp = await request(app).get("/jobs").query({testFilter: 0});
    expect(resp.statusCode).toEqual(400);
  })

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /companies/:handle */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "job_c1",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /companies/:handle */

describe("PATCH /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "job_c1_patched",
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.body).toEqual({
      job: {
        id: testJobIds[0],
        title: "job_c1_patched",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
        title: "job_c1_patched",
        });
    expect(resp.statusCode).toEqual(500);
  });

  //Test to check for unauthorization when user is not admin
  test("failed because not admin user", async function () {
    const resp = await request(app)
      .patch(`/jobs/${testJobIds[0]}`)
      .send({
        title: "job_c1_patched",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
            title: "job_c1_patched",
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on companyHandle change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          companyHandle: "c1-new",
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:handle */

describe("DELETE /jobs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[0]}`)
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[1]}`);
    expect(resp.statusCode).toEqual(500);
  });

  //Test to check for unauthorization when user is not admin
  test("failed because not admin user", async function () {
    const resp = await request(app)
        .delete(`/jobs/${testJobIds[1]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
