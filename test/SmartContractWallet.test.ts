import { expect } from "chai";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { SmartContractWallet } from "../typechain-types";

describe("SmartContractWallet", function () {
  let wallet: SmartContractWallet;
  let owner: SignerWithAddress;
  let guardian1: SignerWithAddress;
  let guardian2: SignerWithAddress;
  let guardian3: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let newOwner: SignerWithAddress;

  beforeEach(async function () {
    // Get signers
    [owner, guardian1, guardian2, guardian3, user1, user2, newOwner] = await hre.ethers.getSigners();

    // Deploy contract
    const SmartContractWallet = await hre.ethers.getContractFactory("SmartContractWallet");
    wallet = await SmartContractWallet.deploy();
    await wallet.waitForDeployment();

    // Fund the wallet
    await owner.sendTransaction({
      to: await wallet.getAddress(),
      value: hre.ethers.parseEther("10.0")
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await wallet.owner()).to.equal(owner.address);
    });

    it("Should have correct confirmations required", async function () {
      expect(await wallet.CONFIRMATIONS_REQUIRED()).to.equal(3);
    });

    it("Should receive Ether", async function () {
      const walletAddress = await wallet.getAddress();
      const balance = await hre.ethers.provider.getBalance(walletAddress);
      expect(balance).to.equal(hre.ethers.parseEther("10.0"));
    });
  });

  describe("Guardian Management", function () {
    it("Should allow owner to set guardians", async function () {
      await wallet.setGuardian(guardian1.address, true);
      expect(await wallet.guardians(guardian1.address)).to.be.true;

      await wallet.setGuardian(guardian1.address, false);
      expect(await wallet.guardians(guardian1.address)).to.be.false;
    });

    it("Should not allow non-owner to set guardians", async function () {
      await expect(
        wallet.connect(user1).setGuardian(guardian1.address, true)
      ).to.be.revertedWith("Not owner");
    });

    it("Should allow setting multiple guardians", async function () {
      await wallet.setGuardian(guardian1.address, true);
      await wallet.setGuardian(guardian2.address, true);
      await wallet.setGuardian(guardian3.address, true);

      expect(await wallet.guardians(guardian1.address)).to.be.true;
      expect(await wallet.guardians(guardian2.address)).to.be.true;
      expect(await wallet.guardians(guardian3.address)).to.be.true;
    });
  });

  describe("Owner Recovery", function () {
    beforeEach(async function () {
      // Set up guardians
      await wallet.setGuardian(guardian1.address, true);
      await wallet.setGuardian(guardian2.address, true);
      await wallet.setGuardian(guardian3.address, true);
    });

    it("Should allow guardians to propose new owner", async function () {
      await wallet.connect(guardian1).proposeNewOwner(newOwner.address);
      expect(await wallet.nextOwner()).to.equal(newOwner.address);
      expect(await wallet.guardiansResetCount()).to.equal(1);
    });

    it("Should not allow non-guardians to propose new owner", async function () {
      await expect(
        wallet.connect(user1).proposeNewOwner(newOwner.address)
      ).to.be.revertedWith("Not guardian");
    });

    it("Should not allow proposing zero address as new owner", async function () {
      await expect(
        wallet.connect(guardian1).proposeNewOwner(hre.ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid address");
    });

    it("Should prevent double voting", async function () {
      await wallet.connect(guardian1).proposeNewOwner(newOwner.address);
      await expect(
        wallet.connect(guardian1).proposeNewOwner(newOwner.address)
      ).to.be.revertedWith("Already voted");
    });

    it("Should change owner after 3 confirmations", async function () {
      await wallet.connect(guardian1).proposeNewOwner(newOwner.address);
      await wallet.connect(guardian2).proposeNewOwner(newOwner.address);
      await wallet.connect(guardian3).proposeNewOwner(newOwner.address);

      expect(await wallet.owner()).to.equal(newOwner.address);
      expect(await wallet.nextOwner()).to.equal(hre.ethers.ZeroAddress);
      expect(await wallet.guardiansResetCount()).to.equal(0);
    });
  });

  describe("Spending Limits", function () {
    it("Should allow owner to set allowances", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await wallet.setAllowance(user1.address, amount);

      const allowance = await wallet.allowances(user1.address);
      expect(allowance.amount).to.equal(amount);
      expect(allowance.isAllowed).to.be.true;
    });

    it("Should not allow non-owner to set allowances", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await expect(
        wallet.connect(user1).setAllowance(user2.address, amount)
      ).to.be.revertedWith("Not owner");
    });

    it("Should set isAllowed to false for zero amount", async function () {
      await wallet.setAllowance(user1.address, 0);

      const allowance = await wallet.allowances(user1.address);
      expect(allowance.amount).to.equal(0);
      expect(allowance.isAllowed).to.be.false;
    });
  });

  describe("Transfers", function () {
    it("Should allow owner to transfer without allowance", async function () {
      const amount = hre.ethers.parseEther("1.0");
      const initialBalance = await hre.ethers.provider.getBalance(user1.address);

      await wallet.transfer(user1.address, amount, "0x");

      const finalBalance = await hre.ethers.provider.getBalance(user1.address);
      expect(finalBalance - initialBalance).to.equal(amount);
    });

    it("Should allow transfer with valid allowance", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await wallet.setAllowance(user1.address, amount);

      const initialBalance = await hre.ethers.provider.getBalance(user2.address);
      await wallet.connect(user1).transfer(user2.address, amount, "0x");

      const finalBalance = await hre.ethers.provider.getBalance(user2.address);
      expect(finalBalance - initialBalance).to.equal(amount);

      // Check allowance is reduced
      const allowance = await wallet.allowances(user1.address);
      expect(allowance.amount).to.equal(0);
    });

    it("Should not allow transfer without allowance", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await expect(
        wallet.connect(user1).transfer(user2.address, amount, "0x")
      ).to.be.revertedWith("Not allowed");
    });

    it("Should not allow transfer exceeding allowance", async function () {
      const allowanceAmount = hre.ethers.parseEther("1.0");
      const transferAmount = hre.ethers.parseEther("2.0");

      await wallet.setAllowance(user1.address, allowanceAmount);

      await expect(
        wallet.connect(user1).transfer(user2.address, transferAmount, "0x")
      ).to.be.revertedWith("Insufficient allowance");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple allowance updates", async function () {
      await wallet.setAllowance(user1.address, hre.ethers.parseEther("1.0"));
      await wallet.setAllowance(user1.address, hre.ethers.parseEther("2.0"));

      const allowance = await wallet.allowances(user1.address);
      expect(allowance.amount).to.equal(hre.ethers.parseEther("2.0"));
    });

    it("Should handle partial allowance spending", async function () {
      const totalAllowance = hre.ethers.parseEther("2.0");
      const transferAmount = hre.ethers.parseEther("0.5");

      await wallet.setAllowance(user1.address, totalAllowance);
      await wallet.connect(user1).transfer(user2.address, transferAmount, "0x");

      const allowance = await wallet.allowances(user1.address);
      expect(allowance.amount).to.equal(hre.ethers.parseEther("1.5"));
    });
  });
});