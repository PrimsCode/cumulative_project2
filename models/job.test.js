"use strict";

const db = require("../db.js");
const {NotFoundError} = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "job_new",
    salary: 20000,
    equity: "0",
    companyHandle: "c1"
  };

  //checking create new job
  test("create a new job", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual(
        {
          ...newJob,
          id: expect.any(Number),
        },
    );
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("get all jobs", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual(
      [{
        id: 1,
        title: "job_c1",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
      },
      {
        id: 2,
        title: "job_c2",
        salary: 1000,
        equity: "1",
        companyHandle: "c2"
      },
      {
        id: 3,
        title: "job_c3",
        salary: 10000,
        equity: "0",
        companyHandle: "c3"
      }]
    );
  });
});

/************************************** get */

describe("get", function () {
  test("get job by id", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
        id: 1,
        title: "job_c1",
        salary: 100,
        equity: "0",
        companyHandle: "c1"
    });
  });

  test("no job with id found", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "job_c1_update",
    salary: 100000,
    equity: "1",
  };

  test("update job successful", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      ...updateData,
      companyHandle: "c1"
    });
  });

  test("update works with null field", async function () {
    const updateDataSetNulls = {
        title: "job_c1_update",
        salary: 100000,
        equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: "c1"
    });

  });

  test("no job with id found", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("delete successful", async function () {
    await Job.remove(1);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("no job with id found", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});